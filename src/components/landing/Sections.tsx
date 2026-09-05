import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Check,
  FileUp,
  Briefcase,
  Brain,
  BarChart3,
  ScanLine,
  Sparkles,
  LayoutTemplate,
  KeyRound,
  MessagesSquare,
  Mail,
  KanbanSquare,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TemplateCard } from "./TemplateCard";
import { TEMPLATES } from "@/lib/matchcv-types";

export function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export function ProblemSection() {
  const cards = [
    {
      title: "Currículo genérico",
      text: "O mesmo currículo dificilmente destaca o que cada vaga procura.",
    },
    {
      title: "Palavras-chave",
      text: "ATS e recrutadores procuram competências específicas relacionadas à vaga.",
    },
    {
      title: "Experiência mal posicionada",
      text: "Você pode possuir a experiência certa, mas ela precisa estar clara no currículo.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="O problema"
        title={
          <>
            Seu currículo pode estar sendo eliminado{" "}
            <span className="text-gradient">antes de chegar ao recrutador.</span>
          </>
        }
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08}>
            <div className="surface-card h-full p-6 transition-transform duration-300 hover:-translate-y-1">
              <p className="text-base font-semibold">{card.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{card.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    icon: FileUp,
    title: "Envie seu currículo",
    text: "Arraste seu currículo ou clique para selecionar. Aceitamos PDF e DOCX.",
  },
  {
    n: "02",
    icon: Briefcase,
    title: "Informe a vaga",
    text: "Cole o link da vaga ou a descrição completa com requisitos e diferenciais.",
  },
  {
    n: "03",
    icon: Brain,
    title: "Análise inteligente",
    text: "A IA compara experiência, formação, tecnologias, palavras-chave, senioridade e idiomas.",
  },
  {
    n: "04",
    icon: BarChart3,
    title: "Receba seu resultado",
    text: "Score geral, score ATS, requisitos atendidos e ausentes, pontos fortes e recomendações.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Como funciona"
          title={
            <>
              Do currículo à candidatura em <span className="text-gradient">poucos minutos.</span>
            </>
          }
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <div className="surface-card h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">{step.n}</span>
                </div>
                <p className="mt-5 text-base font-semibold">{step.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TemplatesSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="Modelos"
        title={
          <>
            Um currículo profissional sem perder <span className="text-gradient">compatibilidade com ATS.</span>
          </>
        }
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATES.slice(0, 4).map((t, i) => (
          <Reveal key={t.id} delay={i * 0.06}>
            <TemplateCard id={t.id} name={t.name} description={t.description} />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="outline" size="lg">
          <Link to="/modelos">Ver todos os modelos</Link>
        </Button>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: ScanLine, title: "Scanner ATS", text: "Compare currículo e vaga." },
  { icon: Sparkles, title: "IA para currículo", text: "Adapte seu currículo automaticamente." },
  { icon: LayoutTemplate, title: "Modelos profissionais", text: "Escolha seu design favorito." },
  { icon: KeyRound, title: "Análise de keywords", text: "Descubra o que está faltando." },
  { icon: MessagesSquare, title: "Preparação para entrevistas", text: "Saiba o que podem perguntar." },
  { icon: Mail, title: "Carta de apresentação", text: "Gere uma carta personalizada." },
  { icon: KanbanSquare, title: "Tracker de candidaturas", text: "Organize seus processos seletivos." },
];

export function FeaturesSection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Recursos" title="Tudo o que você precisa antes de se candidatar." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="surface-card h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <f.icon className="size-5" />
                </span>
                <p className="mt-5 text-base font-semibold">{f.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Camila R.",
    role: "Analista de Dados",
    text: "Finalmente entendi por que eu não avançava nos processos. O relatório mostrou exatamente as palavras-chave que faltavam.",
  },
  {
    name: "Rafael M.",
    role: "Desenvolvedor Back-end",
    text: "Em cinco minutos eu tinha um currículo reorganizado para a vaga, sem inventar nada que eu não tenha feito.",
  },
  {
    name: "Juliana P.",
    role: "Product Designer",
    text: "O tracker de candidaturas me ajudou a organizar sete processos ao mesmo tempo.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading eyebrow="Depoimentos" title="Quem usa chega mais preparado." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <figure className="surface-card h-full p-6">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-foreground">{t.text}</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="text-muted-foreground"> · {t.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function PricingSection() {
  const free = [
    "2 análises por mês",
    "Score ATS",
    "Score de compatibilidade",
    "Principais recomendações",
    "1 currículo otimizado",
  ];
  const pro = [
    "Análises ilimitadas",
    "Currículos otimizados",
    "Todos os templates",
    "Download em PDF",
    "Carta de apresentação",
    "Preparação para entrevista",
    "Histórico ilimitado",
    "Tracker de candidaturas",
  ];

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Planos" title="Comece grátis e evolua quando precisar." />
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="surface-card p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Grátis</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight">R$ 0</p>
            <p className="mt-1 text-sm text-muted-foreground">Para testar seu primeiro match.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {free.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full" size="lg">
              <Link to="/auth">Começar grátis</Link>
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-surface p-8 shadow-card">
            <div className="absolute inset-x-0 top-0 h-1 gradient-primary" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pro</p>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                Mais completo
              </span>
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-tight">
              R$ 24,90
              <span className="text-base font-normal text-muted-foreground">/mês</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Para quem está se candidatando com frequência.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {pro.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full gradient-primary shadow-glow" size="lg">
              <Link to="/auth">Começar grátis</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Pagamento online em breve. Hoje todos os recursos estão liberados para teste.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "A IA inventa experiências para melhorar meu score?",
    a: "Nunca. A IA só reorganiza, reescreve e destaca informações que já existem no seu currículo. Se a vaga pede algo que você não tem, mostramos como requisito ausente e sugerimos incluir apenas se você realmente tiver esse conhecimento.",
  },
  {
    q: "O que significa o score de compatibilidade?",
    a: "O score representa o nível estimado de compatibilidade entre seu currículo e os requisitos identificados na vaga. Não é uma chance matemática de contratação.",
  },
  { q: "Quais formatos posso enviar?", a: "PDF e DOCX, com até 10MB. Também é possível colar o texto do currículo." },
  {
    q: "O PDF gerado é legível por ATS?",
    a: "Sim. Os modelos usam texto real e selecionável, fontes comuns, estrutura limpa e preservam links.",
  },
  {
    q: "Meus dados ficam privados?",
    a: "Sim. Cada currículo pertence somente à sua conta, protegido por regras de acesso no banco de dados. Você pode excluir currículos ou todos os seus dados quando quiser.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" />
      <Accordion type="single" collapsible className="mt-10">
        {FAQS.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-5 pb-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl gradient-deep px-8 py-16 text-center text-primary-foreground shadow-card">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Descubra o que melhorar antes de enviar sua próxima candidatura.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm opacity-85">
          Envie seu currículo, cole a vaga e receba um plano claro de melhorias em poucos minutos.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-8 group">
          <Link to="/app/analise">
            Analisar meu currículo grátis
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
