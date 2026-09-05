import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { AppPage } from "@/components/app/AppPage";

export const Route = createFileRoute("/app/candidaturas")({ component: ApplicationsPage });
function ApplicationsPage() { return <AppPage eyebrow="Acompanhamento" title="Minhas candidaturas" description="Tenha uma visão simples de cada processo seletivo, do primeiro contato à decisão final." icon={FolderKanban} />; }
