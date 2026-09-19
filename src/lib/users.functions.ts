import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "encargado" | "educadora" | "apoderado";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomDigits(length: number) {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (v) => String(v % 10)).join("");
}

function tempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  const base = Array.from(bytes, (b) => b.toString(36)).join("");
  return `Ph${base.slice(0, 10)}!${randomDigits(2)}`;
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "encargado",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Solo un Administrador puede gestionar usuarios.");
}

export const requestUserInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      fullName: string;
      rut: string;
      email: string;
      role: Role;
      courseId: string | null;
    }) => {
      const email = input.email.trim().toLowerCase();
      if (!input.fullName.trim()) throw new Error("El nombre es obligatorio.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El correo no es válido.");
      return {
        fullName: input.fullName.trim(),
        rut: input.rut.trim(),
        email,
        role: input.role,
        courseId: input.courseId,
      };
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const existing = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();
    if (existing.data) throw new Error("Ya existe una cuenta con ese correo.");

    await supabaseAdmin
      .from("pending_users")
      .update({ status: "cancelado" })
      .eq("email", data.email)
      .eq("status", "pendiente");

    const code = randomDigits(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const inserted = await supabaseAdmin
      .from("pending_users")
      .insert({
        full_name: data.fullName,
        rut: data.rut || null,
        email: data.email,
        role: data.role,
        course_id: data.courseId,
        code_hash: await sha256(code),
        expires_at: expiresAt,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);

    // Envío por correo al Administrador: se activa cuando el dominio de correo
    // del proyecto esté verificado. Mientras tanto el código se entrega aquí.
    const adminEmail = (context.claims as { email?: string }).email ?? null;

    return { id: inserted.data.id, code, adminEmail, emailSent: false };
  });

export const confirmUserInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; code: string }) => ({
    id: input.id,
    code: input.code.trim(),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const pending = await supabaseAdmin
      .from("pending_users")
      .select("*")
      .eq("id", data.id)
      .single();
    if (pending.error) throw new Error("No encontramos la solicitud.");
    const row = pending.data;
    if (row.status !== "pendiente") throw new Error("Esta solicitud ya no está pendiente.");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from("pending_users").update({ status: "vencido" }).eq("id", row.id);
      throw new Error("El código venció. Crea la solicitud otra vez.");
    }
    if ((row.attempts ?? 0) >= 5) throw new Error("Demasiados intentos. Crea la solicitud otra vez.");

    if ((await sha256(data.code)) !== row.code_hash) {
      await supabaseAdmin
        .from("pending_users")
        .update({ attempts: (row.attempts ?? 0) + 1 })
        .eq("id", row.id);
      throw new Error("El código no coincide.");
    }

    const password = tempPassword();
    const created = await supabaseAdmin.auth.admin.createUser({
      email: row.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: row.full_name },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "No se pudo crear la cuenta.");
    }
    const newUserId = created.data.user.id;

    const profile = await supabaseAdmin
      .from("profiles")
      .upsert({ id: newUserId, full_name: row.full_name, email: row.email, rut: row.rut })
      .select("id")
      .single();
    if (profile.error) throw new Error(profile.error.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", newUserId);
    const roleRes = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role: row.role });
    if (roleRes.error) throw new Error(roleRes.error.message);

    if (row.course_id && row.role === "educadora") {
      await supabaseAdmin
        .from("courses")
        .update({ teacher_profile_id: newUserId, teacher_name: row.full_name })
        .eq("id", row.course_id);
    }

    await supabaseAdmin
      .from("pending_users")
      .update({ status: "confirmado", confirmed_at: new Date().toISOString() })
      .eq("id", row.id);

    // Correo de credenciales al nuevo usuario: se activa con el dominio verificado.
    return { email: row.email, password, emailSent: false };
  });

export const cancelUserInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const res = await supabaseAdmin
      .from("pending_users")
      .update({ status: "cancelado" })
      .eq("id", data.id);
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });
