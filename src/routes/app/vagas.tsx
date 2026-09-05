import { createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness } from "lucide-react";
import { AppPage } from "@/components/app/AppPage";

export const Route = createFileRoute("/app/vagas")({ component: JobsPage });
function JobsPage() { return <AppPage eyebrow="Oportunidades" title="Minhas vagas" description="Organize as vagas que você analisou e acompanhe os próximos passos de cada oportunidade." icon={BriefcaseBusiness} />; }
