import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { AppPage } from "@/components/app/AppPage";

export const Route = createFileRoute("/app/configuracoes")({ component: SettingsPage });
function SettingsPage() { return <AppPage eyebrow="Sua conta" title="Configurações" description="Gerencie seu perfil, preferências e privacidade dos dados usados nas análises." icon={Settings} />; }
