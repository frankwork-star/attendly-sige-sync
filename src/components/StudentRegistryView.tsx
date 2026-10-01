import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileCheck2, History, Search, ShieldCheck, UserRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { LEVELS, formatDateLong, fullName } from "@/lib/school";
import { useAllowedCourseIds } from "@/lib/scope";
import { useRole } from "@/lib/role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RegistryKind = "datos" | "matricula" | "movimientos";

type RegistryStudent = {
  id: string;
  course_id: string | null;
  list_number: number | null;
  enrollment_number: string | null;
  level: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombres: string;
  run_ipe: string | null;
  birth_date: string | null;
  sex: string | null;
  active: boolean;
  speech_test_url: string | null;
  guardian_interview: string | null;
  courses: { name: string } | null;
};

const CONFIG = {
  datos: {
    eyebrow: "Registros personales",
    title: "Datos de estudiantes",
    description: "Información personal básica y ubicación académica de cada estudiante.",
    icon: UserRound,
  },
  matricula: {
    eyebrow: "Registros personales",
    title: "Procesos de matrícula",
    description: "Revisión del estado documental y antecedentes asociados a cada matrícula.",
    icon: FileCheck2,
  },
  movimientos: {
    eyebrow: "Registros personales",
    title: "Movimientos",
    description: "Consulta del último traslado, baja o cambio registrado para cada estudiante.",
    icon: History,
  },
} as const;

export function StudentRegistryView({ kind }: { kind: RegistryKind }) {
  const { ids: allowedCourseIds, loading: scopeLoading } = useAllowedCourseIds();
  const { canEditStudents } = useRole();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("todos");
  const [course, setCourse] = useState("todos");
  const config = CONFIG[kind];
  const Icon = config.icon;

  const studentsQuery = useQuery({
    queryKey: ["student-registry", kind],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(
          "id, course_id, list_number, enrollment_number, level, apellido_paterno, apellido_materno, nombres, run_ipe, birth_date, sex, active, speech_test_url, guardian_interview, courses(name)",
        )
        .order("level")
        .order("list_number");
      if (error) throw error;
      return (data ?? []) as RegistryStudent[];
    },
  });

  const movementsQuery = useQuery({
    queryKey: ["student-registry-movements"],
    enabled: kind === "movimientos",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_movements")
        .select("id, student_id, movement_date, movement_type, responsible")
        .order("movement_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const students = useMemo(
    () =>
      (studentsQuery.data ?? []).filter(
        (student) =>
          allowedCourseIds === null ||
          (student.course_id ? allowedCourseIds.includes(student.course_id) : false),
      ),
    [allowedCourseIds, studentsQuery.data],
  );

  const courses = useMemo(() => {
    const entries = new Map<string, string>();
    for (const student of students) {
      if (student.course_id && student.courses?.name) {
        entries.set(student.course_id, student.courses.name);
      }
    }
    return [...entries.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [students]);

  const latestMovement = useMemo(() => {
    const map = new Map<string, NonNullable<typeof movementsQuery.data>[number]>();
    for (const movement of movementsQuery.data ?? []) {
      if (!map.has(movement.student_id)) map.set(movement.student_id, movement);
    }
    return map;
  }, [movementsQuery.data]);

  const rows = students.filter((student) => {
    const searchText = `${fullName(student)} ${student.run_ipe ?? ""} ${student.enrollment_number ?? ""}`.toLowerCase();
    return (
      (level === "todos" || student.level === level) &&
      (course === "todos" || student.course_id === course) &&
      searchText.includes(q.trim().toLowerCase())
    );
  });

  const loading = studentsQuery.isLoading || scopeLoading || (kind === "movimientos" && movementsQuery.isLoading);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-primary">{config.eyebrow}</p>
          <h1 className="page-heading flex items-center gap-3">
            <Icon className="size-7 text-primary" />
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
          <ShieldCheck className="mr-1 size-3.5" />
          {canEditStudents ? "Lectura y escritura" : "Solo lectura"}
        </Badge>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, RUN o matrícula"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los niveles</SelectItem>
            {LEVELS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los cursos</SelectItem>
            {courses.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">N°</TableHead>
              <TableHead>Estudiante</TableHead>
              {kind === "datos" && <><TableHead>RUN / IPE</TableHead><TableHead>Nacimiento</TableHead><TableHead>Sexo</TableHead></>}
              {kind === "matricula" && <><TableHead>Matrícula</TableHead><TableHead>Documento</TableHead><TableHead>Entrevista</TableHead></>}
              {kind === "movimientos" && <><TableHead>Último movimiento</TableHead><TableHead>Fecha</TableHead><TableHead>Responsable</TableHead></>}
              <TableHead>Curso</TableHead>
              <TableHead className="text-right">Ficha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Cargando estudiantes…</TableCell></TableRow>}
            {!loading && rows.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No hay estudiantes que coincidan con los filtros.</TableCell></TableRow>}
            {rows.map((student) => {
              const movement = latestMovement.get(student.id);
              return (
                <TableRow key={student.id}>
                  <TableCell>{student.list_number ?? "—"}</TableCell>
                  <TableCell><p className="font-medium">{fullName(student)}</p><p className="text-xs text-muted-foreground">{student.level}</p></TableCell>
                  {kind === "datos" && <><TableCell>{student.run_ipe ?? "—"}</TableCell><TableCell>{student.birth_date ? formatDateLong(student.birth_date) : "—"}</TableCell><TableCell>{student.sex ?? "—"}</TableCell></>}
                  {kind === "matricula" && <><TableCell>{student.enrollment_number ?? "Pendiente"}</TableCell><TableCell><StatusBadge ready={Boolean(student.speech_test_url)} /></TableCell><TableCell><StatusBadge ready={Boolean(student.guardian_interview?.trim())} /></TableCell></>}
                  {kind === "movimientos" && <><TableCell>{movement?.movement_type ?? "Sin movimientos"}</TableCell><TableCell>{movement ? formatDateLong(movement.movement_date) : "—"}</TableCell><TableCell>{movement?.responsible ?? "—"}</TableCell></>}
                  <TableCell>{student.courses?.name ?? "Sin curso"}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/estudiantes/$id" params={{ id: student.id }}>Ver ficha <ArrowRight className="ml-1 size-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ ready }: { ready: boolean }) {
  return ready ? <Badge variant="secondary">Registrado</Badge> : <Badge variant="outline">Pendiente</Badge>;
}
