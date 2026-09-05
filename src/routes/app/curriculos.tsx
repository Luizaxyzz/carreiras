import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppPage } from "@/components/app/AppPage";

export const Route = createFileRoute("/app/curriculos")({ component: ResumesPage });
function ResumesPage() { return <AppPage eyebrow="Biblioteca" title="Meus currículos" description="Acesse seus currículos originais e versões otimizadas para cada oportunidade." icon={FileText} />; }
