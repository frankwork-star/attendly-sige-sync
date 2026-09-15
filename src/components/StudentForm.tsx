import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LEVELS, type Student } from "@/lib/school";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GuardianForm = {
  id?: string;
  list_number: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  address: string;
  comuna: string;
  phone: string;
  email: string;
  observations: string;
};

const emptyGuardian: GuardianForm = {
  list_number: "",
  apellido_paterno: "",
  apellido_materno: "",
  nombres: "",
  address: "",
  comuna: "",
  phone: "",
  email: "",
  observations: "",
};

type Props = {
  student?: Student;
  onDone?: (studentId: string) => void;
};

export function StudentForm({ student, onDone }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    list_number: student?.list_number?.toString() ?? "",
    enrollment_number: student?.enrollment_number ?? "",
    level: student?.level ?? "NT1",
    course_id: student?.course_id ?? "",
    apellido_paterno: student?.apellido_paterno ?? "",
    apellido_materno: student?.apellido_materno ?? "",
    nombres: student?.nombres ?? "",
    run_ipe: student?.run_ipe ?? "",
    birth_date: student?.birth_date ?? "",
    sex: student?.sex ?? "",
    nee_full_support: student?.nee_full_support ?? false,
    address: student?.address ?? "",
    comuna: student?.comuna ?? "",
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: guardianRow } = useQuery({
    queryKey: ["guardian", student?.id],
    enabled: !!student?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guardians")
        .select("*")
        .eq("student_id", student!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [guardianEdits, setGuardianEdits] = useState<Partial<GuardianForm>>({});
  const guardian: GuardianForm = {
    ...emptyGuardian,
    ...(guardianRow
      ? {
          id: guardianRow.id,
          list_number: guardianRow.list_number?.toString() ?? "",
          apellido_paterno: guardianRow.apellido_paterno ?? "",
          apellido_materno: guardianRow.apellido_materno ?? "",
          nombres: guardianRow.nombres ?? "",
          address: guardianRow.address ?? "",
          comuna: guardianRow.comuna ?? "",
          phone: guardianRow.phone ?? "",
          email: guardianRow.email ?? "",
          observations: guardianRow.observations ?? "",
        }
      : {}),
    ...guardianEdits,
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.apellido_paterno.trim() || !form.nombres.trim()) {
        throw new Error("El apellido paterno y los nombres son obligatorios.");
      }
      const payload = {
        list_number: form.list_number ? Number(form.list_number) : null,
        enrollment_number: form.enrollment_number || null,
        level: form.level,
        course_id: form.course_id || null,
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim() || null,
        nombres: form.nombres.trim(),
        run_ipe: form.run_ipe.trim() || null,
        birth_date: form.birth_date || null,
        sex: form.sex || null,
        nee_full_support: form.nee_full_support,
        address: form.address.trim() || null,
        comuna: form.comuna.trim() || null,
      };

      let studentId = student?.id;
      if (studentId) {
        const { error } = await supabase.from("students").update(payload).eq("id", studentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("students")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        studentId = data.id;
      }

      const gPayload = {
        student_id: studentId!,
        list_number: guardian.list_number ? Number(guardian.list_number) : null,
        apellido_paterno: guardian.apellido_paterno || null,
        apellido_materno: guardian.apellido_materno || null,
        nombres: guardian.nombres || null,
        address: guardian.address || null,
        comuna: guardian.comuna || null,
        phone: guardian.phone || null,
        email: guardian.email || null,
        observations: guardian.observations || null,
      };
      const hasGuardianData = Object.values(gPayload).some(
        (v) => v !== null && v !== studentId && v !== "",
      );
      if (guardian.id) {
        const { error } = await supabase.from("guardians").update(gPayload).eq("id", guardian.id);
        if (error) throw error;
      } else if (hasGuardianData) {
        const { error } = await supabase.from("guardians").insert(gPayload);
        if (error) throw error;
      }
      return studentId!;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student", id] });
      qc.invalidateQueries({ queryKey: ["guardian", id] });
      toast.success(student ? "Ficha actualizada" : "Estudiante matriculado");
      onDone?.(id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));
  const setG = (k: keyof GuardianForm, v: string) =>
    setGuardianEdits((prev) => ({ ...prev, [k]: v }));

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold">Datos del alumno</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Número de lista">
            <Input
              type="number"
              value={form.list_number}
              onChange={(e) => set("list_number", e.target.value)}
            />
          </Field>
          <Field label="Número de matrícula">
            <Input
              value={form.enrollment_number}
              onChange={(e) => set("enrollment_number", e.target.value)}
            />
          </Field>
          <Field label="Nivel educativo">
            <Select value={form.level} onValueChange={(v) => set("level", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Curso">
            <Select
              value={form.course_id || "none"}
              onValueChange={(v) => set("course_id", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin curso asignado</SelectItem>
                {(courses ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Apellido paterno *">
            <Input
              required
              value={form.apellido_paterno}
              onChange={(e) => set("apellido_paterno", e.target.value)}
            />
          </Field>
          <Field label="Apellido materno">
            <Input
              value={form.apellido_materno}
              onChange={(e) => set("apellido_materno", e.target.value)}
            />
          </Field>
          <Field label="Nombres *">
            <Input required value={form.nombres} onChange={(e) => set("nombres", e.target.value)} />
          </Field>
          <Field label="RUN / IPE">
            <Input value={form.run_ipe} onChange={(e) => set("run_ipe", e.target.value)} />
          </Field>
          <Field label="Fecha de nacimiento">
            <Input
              type="date"
              value={form.birth_date}
              onChange={(e) => set("birth_date", e.target.value)}
            />
          </Field>
          <Field label="Sexo">
            <Select value={form.sex || "none"} onValueChange={(v) => set("sex", v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin especificar</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Masculino">Masculino</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Dirección">
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Comuna">
            <Input value={form.comuna} onChange={(e) => set("comuna", e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <Switch
            id="nee"
            checked={form.nee_full_support}
            onCheckedChange={(v) => set("nee_full_support", v)}
          />
          <Label htmlFor="nee" className="cursor-pointer">
            N.E.E. con apoyo completo
          </Label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold">Datos del apoderado</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Número de lista">
            <Input
              type="number"
              value={guardian.list_number}
              onChange={(e) => setG("list_number", e.target.value)}
            />
          </Field>
          <Field label="Apellido paterno">
            <Input
              value={guardian.apellido_paterno}
              onChange={(e) => setG("apellido_paterno", e.target.value)}
            />
          </Field>
          <Field label="Apellido materno">
            <Input
              value={guardian.apellido_materno}
              onChange={(e) => setG("apellido_materno", e.target.value)}
            />
          </Field>
          <Field label="Nombres">
            <Input value={guardian.nombres} onChange={(e) => setG("nombres", e.target.value)} />
          </Field>
          <Field label="Dirección">
            <Input value={guardian.address} onChange={(e) => setG("address", e.target.value)} />
          </Field>
          <Field label="Comuna">
            <Input value={guardian.comuna} onChange={(e) => setG("comuna", e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input value={guardian.phone} onChange={(e) => setG("phone", e.target.value)} />
          </Field>
          <Field label="Correo electrónico">
            <Input
              type="email"
              value={guardian.email}
              onChange={(e) => setG("email", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Observaciones">
          <Textarea
            rows={3}
            value={guardian.observations}
            onChange={(e) => setG("observations", e.target.value)}
          />
        </Field>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Guardando…" : student ? "Guardar cambios" : "Matricular estudiante"}
        </Button>
      </div>
    </form>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
