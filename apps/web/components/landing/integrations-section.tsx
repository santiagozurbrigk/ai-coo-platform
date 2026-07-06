import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  File,
  FileQuestion,
  FileText,
  MessageCircle,
  MessageSquare,
  Mic,
  Table2,
  Video,
  Workflow,
  Camera,
} from "lucide-react";

const INTEGRATIONS: { icon: LucideIcon; name: string; saves: string }[] = [
  {
    icon: MessageCircle,
    name: "WhatsApp",
    saves: "Leer chats uno por uno para saber quién califica y quién no.",
  },
  {
    icon: Camera,
    name: "Instagram",
    saves: "Revisar DMs a mano y perder leads entre conversaciones.",
  },
  {
    icon: Workflow,
    name: "ManyChat",
    saves: "Cruzar flujos automáticos con el resto de tus conversaciones a mano.",
  },
  {
    icon: CalendarDays,
    name: "Calendly",
    saves: "Cargar cada llamada agendada en tu CRM o planilla.",
  },
  {
    icon: Video,
    name: "YouTube",
    saves: "Mirar métricas video por video para saber qué contenido convierte.",
  },
  {
    icon: Mic,
    name: "Fathom",
    saves: "Reescuchar reuniones y llamadas para sacar objeciones y tareas.",
  },
  {
    icon: FileQuestion,
    name: "Typeform",
    saves: "Cruzar cada respuesta con el lead correspondiente a mano.",
  },
  {
    icon: FileText,
    name: "Google Forms",
    saves: "Exportar planillas y consolidar respuestas manualmente.",
  },
  {
    icon: MessageSquare,
    name: "Discord",
    saves: "Resumir conversaciones de equipo para no perder contexto.",
  },
  {
    icon: File,
    name: "Google Docs",
    saves: "Copiar y pegar documentos en otra herramienta para tenerlos a mano.",
  },
  {
    icon: Table2,
    name: "Google Sheets",
    saves: "Migrar planillas o mantener datos duplicados en varios lados.",
  },
];

export function IntegrationsSection() {
  return (
    <section className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-950/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Integraciones
        </div>

        <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Se integra con las herramientas que ya usás
        </h2>

        {/* Table */}
        <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10">
          {/* Header row — desktop only */}
          <div className="hidden grid-cols-2 border-b border-white/10 bg-white/[0.03] px-6 py-3 text-xs font-medium uppercase tracking-wider text-white/40 md:grid">
            <span>Se integra con</span>
            <span>Te ahorra</span>
          </div>

          {/* Integration rows */}
          {INTEGRATIONS.map(({ icon: Icon, name, saves }, i) => (
            <div
              key={name}
              className={`grid grid-cols-1 gap-2 px-6 py-4 md:grid-cols-2 md:gap-0 md:py-3${i < INTEGRATIONS.length - 1 ? " border-b border-white/[0.06]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-950/30">
                  <Icon className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">{name}</span>
              </div>
              <p className="pl-11 text-sm text-white/50 md:pl-3">{saves}</p>
            </div>
          ))}
        </div>

        {/* Violet banner */}
        <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-700/15 px-6 py-5 text-center text-sm font-medium text-violet-200">
          Seguís usando y pagando estas plataformas normalmente. OTC se conecta
          a ellas, no las reemplaza.
        </div>
      </div>
    </section>
  );
}
