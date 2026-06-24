import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  ExternalLink,
  MessageCircle,
  Phone,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  MetricBand,
  MetricStat,
  NotchedCard,
  SteppedAlert,
} from "@ai-coo/ui";

export const metadata = {
  title: "Redesign preview · OTC",
  robots: { index: false, follow: false },
};

export default function RedesignPreviewPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-[var(--space-section)]">
      <header className="space-y-2">
        <p className="text-micro font-medium uppercase tracking-wide text-muted-foreground">
          Rama redesign/visual-v2 · Solo preview
        </p>
        <h1 className="text-title font-semibold tracking-tight">
          Visual v2 — tokens, shell y componentes nuevos
        </h1>
        <p className="max-w-2xl text-body text-muted-foreground">
          Página aislada para revisar la banda de métricas, la notched card y la
          alerta escalonada antes del rollout. No está linkeada desde la
          navegación.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
          MetricBand + MetricStat
        </h2>
        <MetricBand>
          <MetricStat
            title="MRR"
            value="$12.400"
            trend="up"
            trendValue="+8.2%"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricStat
            title="Conversaciones activas"
            value="47"
            trend="up"
            trendValue="+12"
            icon={<MessageCircle className="h-4 w-4" />}
          />
          <MetricStat
            title="Calls este mes"
            value="18"
            trend="neutral"
            trendValue="0%"
            icon={<Phone className="h-4 w-4" />}
          />
          <MetricStat
            title="Leads calificados"
            value="23"
            trend="up"
            trendValue="+5"
            badge="Meta 20"
            icon={<Users className="h-4 w-4" />}
          />
        </MetricBand>
      </section>

      <section className="space-y-3">
        <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
          NotchedCard — detalle de cliente (mock)
        </h2>
        <NotchedCard
          tab={
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Cliente activo
            </span>
          }
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-title font-semibold tracking-tight">
                  Acme Growth Co.
                </h3>
                <p className="mt-1 text-caption text-muted-foreground">
                  SaaS B2B · Onboarding completado
                </p>
              </div>
              <Badge variant="secondary">MRR $2.800</Badge>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-micro text-muted-foreground">Última call</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-caption font-medium">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  24 may · Discovery 42 min
                </dd>
              </div>
              <div>
                <dt className="text-micro text-muted-foreground">Score ventas</dt>
                <dd className="mt-1 text-caption font-medium tabular-nums">
                  78 / 100
                </dd>
              </div>
              <div>
                <dt className="text-micro text-muted-foreground">Próximo paso</dt>
                <dd className="mt-1 text-caption font-medium">
                  Enviar propuesta
                </dd>
              </div>
            </dl>

            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-caption text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.03]">
              <p className="font-medium text-foreground">Última interacción</p>
              <p className="mt-1">
                Lead preguntó por pricing anual en ManyChat. Objeción principal:
                timing de implementación.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm">Ver timeline</Button>
              <Button size="sm" variant="outline">
                Abrir conversación
              </Button>
            </div>
          </div>
        </NotchedCard>
      </section>

      <section className="space-y-3">
        <h2 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
          SteppedAlert — BYOK sin créditos (copy real)
        </h2>
        <SteppedAlert
          variant="warning"
          title="Sin créditos en Anthropic"
          icon={<AlertTriangle className="h-4 w-4" />}
          action={
            <Button size="sm" variant="outline" asChild>
              <Link
                href="https://console.anthropic.com/settings/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                Ir a billing de Anthropic
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <p>
            Tu API key es válida pero tu cuenta de Anthropic no tiene créditos
            cargados. Las funciones de IA no van a funcionar hasta que cargues
            saldo en{" "}
            <Link
              href="https://console.anthropic.com/settings/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              console.anthropic.com
            </Link>
            .
          </p>
          <p className="text-caption">
            Mismo mensaje que hoy aparece en Settings → API de Claude cuando el
            estado es <code className="rounded bg-muted px-1 py-0.5 text-micro">valid_no_credits</code>.
          </p>
        </SteppedAlert>
      </section>
    </div>
  );
}
