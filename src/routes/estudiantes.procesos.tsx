import { createFileRoute } from "@tanstack/react-router";
import { StudentRegistryView } from "@/components/StudentRegistryView";

export const Route = createFileRoute("/estudiantes/procesos")({
  head: () => ({ meta: [
    { title: "Procesos de matrícula — Escuela Paihuen" },
    { name: "description", content: "Seguimiento documental y antecedentes del proceso de matrícula de estudiantes." },
    { property: "og:title", content: "Procesos de matrícula — Escuela Paihuen" },
    { property: "og:description", content: "Estado de matrícula, documentos y entrevistas de estudiantes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <StudentRegistryView kind="matricula" />,
});
