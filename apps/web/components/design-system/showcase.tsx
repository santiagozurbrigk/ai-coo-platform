"use client";

import {
  Activity,
  ArrowUpRight,
  DollarSign,
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AiCard,
  Badge,
  Button,
  Caption,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  GlassPanel,
  Heading,
  Input,
  MetricCard,
  Separator,
  SidebarShell,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Topbar,
  cn,
} from "@ai-coo/ui";
import { AppLogo } from "@/components/brand";
import { TrendLineChart } from "@/components/charts/platform";
import { es } from "@/lib/locale/es";

const chartData = [
  { label: "Lun", value: 42 },
  { label: "Mar", value: 58 },
  { label: "Mié", value: 45 },
  { label: "Jue", value: 72 },
  { label: "Vie", value: 65 },
  { label: "Sáb", value: 38 },
  { label: "Dom", value: 51 },
];

type DemoRow = { name: string; role: string; status: string };

const tableData: DemoRow[] = [
  { name: "María López", role: "Operador", status: "Activo" },
  { name: "Jordan Lee", role: "Operador", status: "Activo" },
  { name: "Sam Ortiz", role: "PM", status: "Ausente" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <Text muted className="mt-1">{description}</Text>}
      </div>
      {children}
    </section>
  );
}

export function DesignSystemShowcase() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Topbar
          title="Sistema de diseño"
          subtitle="Fase 0.2 — AI COO"
          search={
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar componentes..." />
            </div>
          }
          actions={
            <Button size="sm">
              <Sparkles className="h-4 w-4" />
              Nativo IA
            </Button>
          }
        />

        <div className="mx-auto max-w-6xl space-y-16 p-8 pb-24">
          <header className="space-y-2 animate-fade-in">
            <Caption>Fase 0.2</Caption>
            <h1 className="text-3xl font-semibold tracking-tight text-gradient-ai">
              Sistema de diseño AI COO
            </h1>
            <Text muted className="max-w-2xl">
              Solo modo oscuro. Estética ejecutiva premium inspirada en Linear,
              Attio, Stripe, Raycast, Vercel y Arc Browser.
            </Text>
          </header>

          <Section title="Tipografía" description="Escala y jerarquía">
            <div className="space-y-4 rounded-lg border border-border p-6">
              <Heading as="h1">Encabezado 1 — Panel ejecutivo</Heading>
              <Heading as="h2">Encabezado 2 — Título de sección</Heading>
              <Heading as="h3">Encabezado 3 — Grupo de tarjetas</Heading>
              <Text>Texto de cuerpo para descripciones y contexto operativo.</Text>
              <Caption>Leyenda — etiquetas y metadatos</Caption>
            </div>
          </Section>

          <Section title="Color y badges" description="Tokens semánticos">
            <div className="flex flex-wrap gap-2">
              <Badge>Predeterminado</Badge>
              <Badge variant="secondary">Secundario</Badge>
              <Badge variant="success">Éxito</Badge>
              <Badge variant="warning">Advertencia</Badge>
              <Badge variant="destructive">Riesgo</Badge>
              <Badge variant="ai">IA</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { name: "Fondo", class: "bg-background border" },
                { name: "Tarjeta", class: "bg-card border" },
                { name: "Primario", class: "bg-primary" },
                { name: "IA", class: "bg-ai" },
                { name: "Éxito", class: "bg-success" },
                { name: "Atenuado", class: "bg-muted" },
              ].map((swatch) => (
                <div key={swatch.name} className="space-y-2">
                  <div className={cn("h-12 rounded-lg", swatch.class)} />
                  <Caption>{swatch.name}</Caption>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Botones">
            <div className="flex flex-wrap gap-3">
              <Button>Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="outline">Contorno</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button variant="glass">Cristal</Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive">Destructivo</Button>
                </TooltipTrigger>
                <TooltipContent>Acción crítica</TooltipContent>
              </Tooltip>
            </div>
          </Section>

          <Section title="Tarjetas de métricas" description="KPIs del panel">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Tasa de agendamiento"
                value="34,2%"
                trend="up"
                trendValue="+4,1%"
                icon={<ArrowUpRight className="h-4 w-4" />}
              />
              <MetricCard
                title="Conversaciones activas"
                value="128"
                subtitle="12 sin responder"
                badge="En vivo"
                icon={<Activity className="h-4 w-4" />}
              />
              <MetricCard
                title="MRR"
                value="$84.2K"
                trend="up"
                trendValue="+8,3%"
                icon={<DollarSign className="h-4 w-4" />}
              />
              <MetricCard
                title="Carga del equipo"
                value="72%"
                trend="down"
                trendValue="-5%"
                icon={<Users className="h-4 w-4" />}
              />
            </div>
          </Section>

          <Section title="Tarjetas IA" description="Superficies de inteligencia">
            <div className="grid gap-4 lg:grid-cols-2">
              <AiCard
                title="Insight ejecutivo"
                confidence={0.92}
                source="Inputs semanales + métricas de ventas"
              >
                Los tiempos de respuesta del equipo de delivery subieron un 18% esta
                semana. Considera reforzar el follow-up del equipo de ventas antes de la
                revisión del pipeline del viernes.
              </AiCard>
              <AiCard
                variant="recommendation"
                title="Acción recomendada"
                confidence={0.87}
              >
                Actualiza el SOP de onboarding — tres operadores citaron pasos
                desactualizados en sus reportes semanales.
              </AiCard>
            </div>
          </Section>

          <Section title="Gráficos">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de agendamientos</CardTitle>
                <CardDescription>Últimos 7 días — datos mock</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendLineChart data={chartData} />
              </CardContent>
            </Card>
          </Section>

          <Section title="Paneles de cristal">
            <div className="grid gap-4 md:grid-cols-2">
              <GlassPanel className="p-6" glow>
                <Text className="font-medium">Cristal + brillo</Text>
                <Text muted className="mt-2 text-sm">
                  Para paneles de IA y superficies elevadas.
                </Text>
              </GlassPanel>
              <GlassPanel variant="strong" className="p-6">
                <Text className="font-medium">Cristal fuerte</Text>
                <Text muted className="mt-2 text-sm">
                  Modales y panel de contexto.
                </Text>
              </GlassPanel>
            </div>
          </Section>

          <Section title="Formularios">
            <Card className="max-w-md">
              <CardContent className="space-y-4 pt-6">
                <FormField label="Nombre de la organización" required>
                  <Input placeholder="Acme Coaching Co." />
                </FormField>
                <FormField
                  label="Contexto semanal"
                  description="Menos de 2 minutos — voz o texto"
                >
                  <Textarea placeholder="¿Qué cambió en operaciones esta semana?" />
                </FormField>
                <Button className="w-full">Enviar input</Button>
              </CardContent>
            </Card>
          </Section>

          <Section title="Tabla de datos">
            <DataTable<DemoRow>
              title="Miembros del equipo"
              description="Datos operativos mock"
              emptyMessage={es.common.noData}
              keyExtractor={(r) => r.name}
              columns={[
                { key: "name", header: "Nombre", cell: (r) => r.name },
                { key: "role", header: "Rol", cell: (r) => r.role },
                {
                  key: "status",
                  header: "Estado",
                  cell: (r) => (
                    <Badge
                      variant={r.status === "Activo" ? "success" : "secondary"}
                    >
                      {r.status}
                    </Badge>
                  ),
                },
              ]}
              data={tableData}
            />
          </Section>

          <Section title="Pestañas y modal">
            <Tabs defaultValue="overview" className="max-w-lg">
              <TabsList>
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="risks">Riesgos</TabsTrigger>
                <TabsTrigger value="actions">Acciones</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Text muted>Contenido de pestaña para secciones del reporte ejecutivo.</Text>
              </TabsContent>
              <TabsContent value="risks">
                <Text muted>Indicadores de riesgo y cuellos de botella.</Text>
              </TabsContent>
              <TabsContent value="actions">
                <Text muted>Recomendaciones generadas por IA.</Text>
              </TabsContent>
            </Tabs>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Abrir modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generar SOP</DialogTitle>
                  <DialogDescription>
                    Prototipo Fase 0 — sin backend de IA conectado.
                  </DialogDescription>
                </DialogHeader>
                <Text muted>
                  Este modal usa estilo cristal-fuerte con desenfoque de fondo.
                </Text>
                <DialogFooter>
                  <Button variant="ghost">{es.common.cancel}</Button>
                  <Button>{es.common.continue}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          <Section title="Carga">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-full max-w-xs" />
              <Skeleton className="h-20 w-full max-w-xs" />
            </div>
          </Section>

          <Section
            title="Shell de barra lateral"
            description="Primitivo de navegación — Fase 0.4 conecta rutas reales"
          >
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex h-[320px]">
                <SidebarShell
                  logo={<AppLogo href="/dashboard" display="sidebar" />}
                  workspace={
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Espacio principal
                    </Button>
                  }
                  items={[
                    {
                      label: "Panel",
                      href: "/dashboard",
                      icon: <LayoutDashboard className="h-4 w-4" />,
                      active: true,
                    },
                    {
                      label: "Ventas",
                      href: "/sales/inbox",
                      children: [
                        { label: "Bandeja", href: "/sales/inbox" },
                        { label: "Métricas", href: "/sales/metrics" },
                      ],
                    },
                  ]}
                  footer={
                    <Text muted className="text-xs px-2">
                      Prototipo Fase 0
                    </Text>
                  }
                />
                <div className="flex flex-1 items-center justify-center bg-muted/20">
                  <Text muted>Área de contenido principal</Text>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          <footer className="text-center">
            <Caption>
              Siguiente: Fase 0.3 Layout global · Fase 0.4 Navegación
            </Caption>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
