import { createFileRoute } from "@tanstack/react-router";
import { StudentRegistryView } from "@/components/StudentRegistryView";

export const Route = createFileRoute("/estudiantes/datos")({
  head: () => ({ meta: [
    { title: "Datos de estudiantes — Escuela Paihuen" },
    { name: "description", content: "Consulta de datos personales básicos de estudiantes por nivel y curso." },
    { property: "og:title", content: "Datos de estudiantes — Escuela Paihuen" },
    { property: "og:description", content: "Información personal básica y ubicación académica de estudiantes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <StudentRegistryView kind="datos" />,
});
