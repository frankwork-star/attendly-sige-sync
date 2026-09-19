import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña · Gestión Escolar Paihuen" },
      {
        name: "description",
        content: "Define una nueva contraseña para tu cuenta del sistema de gestión escolar.",
      },
      { property: "og:title", content: "Nueva contraseña · Gestión Escolar Paihuen" },
      {
        property: "og:description",
        content: "Recupera el acceso definiendo una contraseña nueva.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("No pudimos cambiar la contraseña", { description: error.message });
      return;
    }
    toast.success("Contraseña actualizada");
    void navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-heading">Definir nueva contraseña</h1>
      {!ready ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Abre el enlace que recibiste por correo para poder definir tu nueva contraseña.
        </p>
      ) : (
        <form onSubmit={submit} className="surface-panel mt-6 space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Repetir contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            <KeyRound className="size-4" />
            {busy ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      )}
    </div>
  );
}
