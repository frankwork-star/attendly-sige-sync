import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/lib/role";
import { bootstrapFirstAdmin, hasAnyUser } from "@/lib/bootstrap.functions";
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
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Se comprueba una sola vez al cargar la página si hay sesión iniciada.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setSessionChecked(true);
    });
  }, []);

  const usersExist = useQuery({
    queryKey: ["has-any-user"],
    queryFn: () => hasAnyUser(),
    staleTime: Infinity,
    // Solo se pregunta a la base de datos si NO hay sesión iniciada.
    enabled: sessionChecked && !hasSession,
  });

  if (!sessionChecked) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  // Con sesión iniciada, siempre es el formulario de ingreso normal.
  if (hasSession || usersExist.data !== false) {
    return <LoginForm />;
  }

  return <FirstAdminSetup />;
}

function LoginForm() {
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
    </div>
  );
}

function FirstAdminSetup() {
  const navigate = useNavigate();
  const { refresh } = useRole();
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function createFirstAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    try {
      await bootstrapFirstAdmin({ data: { fullName, email, password } });
    } catch (err) {
      setBusy(false);
      toast.error("No pudimos crear la cuenta", {
        description: err instanceof Error ? err.message : undefined,
      });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.success("Cuenta creada", { description: "Ahora ingresa con tu correo y contraseña." });
      return;
    }
    await refresh();
    toast.success("Cuenta de Administrador creada", { description: "Bienvenido al sistema." });
    void navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-heading">Configuración inicial</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Aún no existe ningún usuario en el sistema. Crea la primera cuenta: quedará registrada
        automáticamente como <span className="font-medium">Administrador (Encargado)</span> y desde
        ella podrás crear al resto del equipo.
      </p>

      <form onSubmit={createFirstAdmin} className="surface-panel mt-6 space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="setup-name">Nombre completo</Label>
          <Input
            id="setup-name"
            required
            maxLength={120}
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup-email">Correo electrónico</Label>
          <Input
            id="setup-email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup-password">Contraseña</Label>
          <Input
            id="setup-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup-confirm">Confirmar contraseña</Label>
          <Input
            id="setup-confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          <UserPlus className="size-4" />
          {busy ? "Creando cuenta…" : "Crear cuenta de Administrador"}
        </Button>
      </form>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        Este formulario solo aparece mientras no exista ningún usuario registrado.
      </p>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        <Link to="/" className="underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
