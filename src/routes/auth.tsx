import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [fullName, setFullName] = useState("");
  const [pending, setPending] = useState(false);

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

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("No pudimos crear la cuenta", { description: error.message });
      return;
    }
    if (!data.session) {
      setPending(true);
      toast.success("Cuenta creada", {
        description: "Revisa tu correo y confirma el enlace para poder ingresar.",
      });
      return;
    }
    await refresh();
    void navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-heading">Acceso al sistema</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La primera persona que se registre queda como Encargado y podrá asignar los roles del resto
        del equipo desde el panel de administración.
      </p>

      {pending ? (
        <div className="surface-panel mt-6 p-6 text-sm">
          <p className="font-semibold">Confirma tu correo</p>
          <p className="mt-2 text-muted-foreground">
            Te enviamos un enlace a <span className="font-medium">{email}</span>. Ábrelo para
            activar la cuenta y luego vuelve a ingresar.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setPending(false)}>
            Volver
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="signin" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">
              Ingresar
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">
              Crear cuenta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="surface-panel space-y-4 p-6">
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
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="surface-panel space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="full-name">Nombre y apellido</Label>
                <Input
                  id="full-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-up">Correo electrónico</Label>
                <Input
                  id="email-up"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-up">Contraseña</Label>
                <Input
                  id="password-up"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full">
                <UserPlus className="size-4" />
                {busy ? "Creando…" : "Crear cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link to="/" className="underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
