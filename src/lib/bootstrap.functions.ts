import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Indica si ya existe al menos un usuario en el sistema.
 * Es pública pero solo expone un booleano.
 */
export const hasAnyUser = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return (count ?? 0) > 0;
});

const bootstrapSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().email("Correo inválido").max(255),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
});

/**
 * Crea la primera cuenta del sistema. Solo opera cuando no existe
 * ningún usuario; el trigger handle_new_user la registra como encargado.
 */
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator(bootstrapSchema)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (countError) throw countError;
    if ((count ?? 0) > 0) {
      throw new Error("Ya existen usuarios en el sistema. Pide una cuenta al Administrador.");
    }
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error) throw error;
    return { ok: true };
  });
