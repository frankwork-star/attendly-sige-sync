import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar · Gestión Escolar Paihuen" },
      {
        name: "description",
        content:
          "Ingresa con tu correo institucional para administrar matrículas, salud escolar y asistencia.",
      },
      { property: "og:title", content: "Ingresar · Gestión Escolar Paihuen" },
      {
        property: "og:description",
        content: "Acceso para educadoras, jefaturas UTP y apoderados de la Escuela Paihuen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { refresh } = useRole();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recovering, setRecovering] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("No pudimos ingresar", { description: error.message });
      return;
    }
    await refresh();
    toast.success("Bienvenido");
    void navigate({ to: "/" });
  }

  async function sendRecovery() {
    if (!email) {
      toast.error("Escribe tu correo para enviarte el enlace");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error("No pudimos enviar el enlace", { description: error.message });
      return;
    }
    setRecovering(true);
    toast.success("Enlace enviado", { description: "Revisa tu correo para definir la nueva clave." });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-heading">Acceso al sistema</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Las cuentas las crea el Administrador del establecimiento. Ingresa con el correo y la
        contraseña que recibiste.
      </p>

      <form onSubmit={signIn} className="surface-panel mt-6 space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          <LogIn className="size-4" />
          {busy ? "Ingresando…" : "Ingresar"}
        </Button>
        <button
          type="button"
          onClick={sendRecovery}
          disabled={busy}
          className="w-full text-center text-xs text-muted-foreground underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
        {recovering && (
          <p className="text-center text-xs text-muted-foreground">
            Te enviamos un enlace a <span className="font-medium">{email}</span>.
          </p>
        )}
      </form>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        ¿Necesitas una cuenta? Pídela al Administrador del establecimiento.
      </p>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        <Link to="/" className="underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
