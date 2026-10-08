import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Guardia de sesión para rutas con datos: sin usuario autenticado,
 * redirige a la pantalla de ingreso.
 */
export async function requireSession() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw redirect({ to: "/auth" });
}
