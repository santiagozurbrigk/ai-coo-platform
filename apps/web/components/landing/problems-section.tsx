import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  ClipboardList,
  DollarSign,
  MessageSquareX,
  UserX,
} from "lucide-react";

const PROBLEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: UserX,
    title: "Leads descalificados que igual llegan a la llamada",
    desc: "La IA cruza el chat del lead con tus estándares de agendamiento y el contexto del lead, y te avisa en el momento si esa persona no califica. Tu equipo solo habla con gente que sí puede cerrar.",
  },
  {
    icon: MessageSquareX,
    title: "La misma objeción se repite y tu closer la sigue perdiendo",
    desc: "La IA escucha cada llamada y arma un reporte automático de las objeciones más frecuentes, separando dudas de oferta, de contenido y de venta real. Dejás de perder la misma venta dos veces.",
  },
  {
    icon: BarChart2,
    title: "No sabés cuál de tus últimos 10 reels te trajo un cliente de verdad",
    desc: "Conectamos cada pieza de contenido con los leads, llamadas, cierres y dinero que generó. Sabés qué formato y qué tema traen clientes, no más vistas.",
  },
  {
    icon: ClipboardList,
    title: "Tu equipo sale de la reunión sin un plan claro",
    desc: "Después de cada reunión, el sistema propone las tareas automáticamente, las asigna por rol, les pone fecha y avisa si algo quedó trabado. Reuniones efectivas, sin revisar grabaciones.",
  },
];

function ProblemCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-950/40">
        <Icon className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
    </div>
  );
}

export function ProblemsSection() {
  return (
    <section className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-950/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Los problemas
        </div>

        <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Todo lo que hoy se te escapa
        </h2>

        {/* 4-card grid */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PROBLEMS.map(({ icon, title, desc }) => (
            <ProblemCard key={title} icon={icon} title={title} desc={desc} />
          ))}
        </div>

        {/* Full-width card */}
        <div className="mt-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-start">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-950/40">
              <DollarSign className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-snug">
                Comisiones, ads y plataformas, todo disperso
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Configurás una sola vez cómo cobra cada closer, setter y miembro
                del equipo. El sistema suma gastos, resta comisiones y te dice la
                ganancia real de cada cierre de mes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
