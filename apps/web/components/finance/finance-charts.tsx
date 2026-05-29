"use client";

import { useMemo, useState, type ReactNode } from "react";
import { GlassPanel, cn } from "@ai-coo/ui";
import { motion } from "framer-motion";
import { useFinanceData } from "@/providers";
import { formatMoney } from "@/lib/finance/format";
import {
  chartColors,
  chartGradients,
  expenseSegmentColors,
  platformRingColors,
  revenueStackColors,
} from "@/lib/chart/colors";
import type { ExpensesSummary } from "@/types/expenses";
import type { MonthlySeriesPoint } from "@/types/finance";

const W = 520;
const H = 200;
const PAD = { t: 16, r: 12, b: 28, l: 44 };

function ChartShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassPanel className={cn("p-4 space-y-3", className)}>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {children}
      </motion.div>
    </GlassPanel>
  );
}

function finite(n: number, fallback = 0): number {
  return Number.isFinite(n) ? n : fallback;
}

function scaleLinear(
  values: number[],
  range: [number, number]
): (v: number) => number {
  const finiteValues = values.filter(Number.isFinite);
  const min = finiteValues.length ? Math.min(...finiteValues, 0) : 0;
  const max = finiteValues.length ? Math.max(...finiteValues, 1) : 1;
  const span = max - min || 1;
  const [a, b] = range;
  return (v) => a + ((finite(v) - min) / span) * (b - a);
}

function xAtIndex(i: number, count: number, innerW: number, padL: number): number {
  const denom = Math.max(count - 1, 1);
  return padL + (i / denom) * innerW;
}

export function FinanceCharts() {
  const { monthlySeries, financeSummary, paymentPlatforms, expensesSummary } =
    useFinanceData();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FacturacionVsCashChart data={monthlySeries} />
      <PorCobrarSteppedChart months={financeSummary.porCobrarByMonth} />
      <ExpenseRadialChart expenses={expensesSummary} />
      <PlatformRingChart
        platforms={paymentPlatforms}
        balances={financeSummary.platformBalances}
      />
      <MarginHealthChart data={monthlySeries} />
      <RevenueStackedChart data={monthlySeries} />
    </div>
  );
}

function FacturacionVsCashChart({ data }: { data: MonthlySeriesPoint[] }) {
  const [tip, setTip] = useState<number | null>(null);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (i: number) => xAtIndex(i, data.length, innerW, PAD.l);
  const yFact = scaleLinear(
    data.map((d) => d.facturacion),
    [PAD.t + innerH, PAD.t]
  );
  const yCash = scaleLinear(
    data.map((d) => d.cashCollected),
    [PAD.t + innerH, PAD.t]
  );

  const area = (key: "facturacion" | "cashCollected", fill: string) => {
    const pts = data.map((d, i) => `${x(i)},${key === "facturacion" ? yFact(d.facturacion) : yCash(d.cashCollected)}`);
    const baseline = PAD.t + innerH;
    return `${pts.join(" ")} ${x(data.length - 1)},${baseline} ${x(0)},${baseline}`;
  };

  return (
    <ChartShell
      title="Facturación vs Cash Collected"
      subtitle="Últimos 6 meses · el espacio entre curvas = gastos"
      className="lg:col-span-2"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id="factGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.info} stopOpacity="0.35" />
            <stop offset="100%" stopColor={chartColors.info} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area("facturacion", "factGrad")} fill="url(#factGrad)" />
        <polygon points={area("cashCollected", "cashGrad")} fill="url(#cashGrad)" />
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          points={data.map((d, i) => `${x(i)},${yFact(d.facturacion)}`).join(" ")}
        />
        <polyline
          fill="none"
          stroke={chartColors.info}
          strokeWidth="2"
          points={data.map((d, i) => `${x(i)},${yCash(d.cashCollected)}`).join(" ")}
        />
        {data.map((d, i) => (
          <g key={d.month}>
            <circle
              cx={x(i)}
              cy={yFact(d.facturacion)}
              r={tip === i ? 6 : 3}
              className="fill-primary cursor-pointer"
              onMouseEnter={() => setTip(i)}
              onMouseLeave={() => setTip(null)}
            />
            <text
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
              fontSize="10"
            >
              {d.month}
            </text>
          </g>
        ))}
        {tip !== null && (
          <foreignObject x={x(tip) - 70} y={PAD.t - 4} width="140" height="56">
            <div className="rounded-lg border border-white/10 bg-background/80 backdrop-blur-md px-2 py-1.5 text-[10px] shadow-lg">
              <p>Fact: {formatMoney(data[tip].facturacion)}</p>
              <p>Cash: {formatMoney(data[tip].cashCollected)}</p>
            </div>
          </foreignObject>
        )}
      </svg>
    </ChartShell>
  );
}

function PorCobrarSteppedChart({
  months,
}: {
  months: { month: string; amount: number }[];
}) {
  const W2 = 400;
  const H2 = 160;
  const stepW = W2 / (months.length + 1);
  const max = Math.max(...months.map((m) => m.amount), 1);

  return (
    <ChartShell
      title="Por cobrar por mes"
      subtitle="Runway de cobros futuros · cuotas pendientes"
    >
      <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full">
        <defs>
          <linearGradient id="amberLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={chartGradients.warningLine.start} />
            <stop offset="100%" stopColor={chartGradients.warningLine.end} />
          </linearGradient>
        </defs>
        {months.map((m, i) => {
          const y = H2 - 24 - (finite(m.amount) / max) * (H2 - 48);
          const x = stepW * (i + 1);
          const nextX = stepW * (i + 2);
          const nextY =
            i < months.length - 1
              ? H2 - 24 - (finite(months[i + 1].amount) / max) * (H2 - 48)
              : y;
          return (
            <g key={m.month}>
              {i < months.length - 1 && (
                <path
                  d={`M ${x} ${y} H ${nextX} V ${nextY}`}
                  fill="none"
                  stroke="url(#amberLine)"
                  strokeWidth="2.5"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={chartColors.warning}
                className="drop-shadow-[0_0_6px_hsl(var(--warning)/0.6)]"
              />
              <text x={x} y={H2 - 4} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
                {m.month}
              </text>
              <text x={x} y={y - 10} textAnchor="middle" fontSize="10" className="fill-amber-400">
                {formatMoney(m.amount)}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

function ExpenseRadialChart({ expenses }: { expenses: ExpensesSummary }) {
  const segments = [
    { label: "Gastos fijos", value: expenses.fixedMonthly, color: expenseSegmentColors[0] },
    {
      label: "Suscripciones",
      value: expenses.subscriptionsMonthly,
      color: expenseSegmentColors[1],
    },
    {
      label: "Salarios equipo",
      value: expenses.teamFixedMonthly,
      color: expenseSegmentColors[2],
    },
    {
      label: "Comisiones",
      value: expenses.teamCommissionsMonthly,
      color: expenseSegmentColors[3],
    },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 70;
  const cx = 100;
  const cy = 100;
  let angle = -90;

  const arcs = (segments.length > 0 ? segments : [{ label: "—", value: 1, color: expenseSegmentColors[0] }]).map((seg) => {
    const sweep = (seg.value / total) * 360;
    const start = angle;
    angle += sweep;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(start));
    const y1 = cy + r * Math.sin(rad(start));
    const x2 = cx + r * Math.cos(rad(start + sweep));
    const y2 = cy + r * Math.sin(rad(start + sweep));
    const large = sweep > 180 ? 1 : 0;
    return {
      ...seg,
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    };
  });

  return (
    <ChartShell title="Distribución de gastos" subtitle="Arco grueso con resplandor por categoría">
      <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto">
        {arcs.map((a) => (
          <path
            key={a.label}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth="18"
            strokeLinecap="round"
            className="drop-shadow-[0_0_6px_currentColor]"
            style={{ color: a.color }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground text-sm font-semibold" fontSize="13">
          {formatMoney(expenses.totalMonthly)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
          Total gastos
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </ChartShell>
  );
}

function PlatformRingChart({
  platforms,
  balances,
}: {
  platforms: { id: string; name: string; currency: string }[];
  balances: { platformId: string; amount: number }[];
}) {
  const amounts = platforms.map(
    (p) => balances.find((b) => b.platformId === p.id)?.amount ?? 0
  );
  const total = amounts.reduce((a, b) => a + b, 0) || 1;
  const colors = [...platformRingColors];
  const cx = 100;
  const cy = 100;

  const rings = useMemo(() => {
    return platforms.map((p, i) => {
      const r = 78 - i * 16;
      const pct = amounts[i] / total;
      const circ = 2 * Math.PI * r;
      return { ...p, r, offset: circ * (1 - pct), color: colors[i % colors.length], amount: amounts[i] };
    });
  }, [platforms, amounts, total]);

  return (
    <ChartShell title="Ingresos por plataforma" subtitle="Anillos concéntricos · grosor = volumen">
      <svg viewBox="0 0 200 200" className="w-full max-w-[240px] mx-auto">
        {rings.map((ring) => (
          <circle
            key={ring.id}
            cx={cx}
            cy={cy}
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * ring.r}
            strokeDashoffset={ring.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={0.9}
          />
        ))}
        <text x={cx} y={cy} textAnchor="middle" className="fill-foreground text-xs font-semibold" fontSize="11">
          Multi-moneda
        </text>
      </svg>
      <div className="flex flex-wrap gap-2 justify-center text-xs">
        {rings.map((r) => (
          <span key={r.id}>
            {r.name}: {formatMoney(r.amount, r.currency)}
          </span>
        ))}
      </div>
    </ChartShell>
  );
}

function MarginHealthChart({ data }: { data: MonthlySeriesPoint[] }) {
  const threshold = 60;
  const W3 = 520;
  const H3 = 180;
  const innerW = W3 - 56;
  const innerH = H3 - 40;
  const y = scaleLinear(
    data.map((d) => d.marginPercent),
    [innerH + 20, 20]
  );
  const x = (i: number) => xAtIndex(i, data.length, innerW, 44);

  return (
    <ChartShell title="Evolución del margen" subtitle={`Umbral objetivo ${threshold}%`}>
      <svg viewBox={`0 0 ${W3} ${H3}`} className="w-full">
        <line
          x1={44}
          y1={y(threshold)}
          x2={W3 - 12}
          y2={y(threshold)}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="4 4"
          opacity={0.5}
        />
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          points={data.map((d, i) => `${x(i)},${y(d.marginPercent)}`).join(" ")}
        />
        {data.map((d, i) => {
          const above = d.marginPercent >= threshold;
          return (
            <circle
              key={d.month}
              cx={x(i)}
              cy={y(finite(d.marginPercent))}
              r="4"
              fill={above ? chartColors.success : chartColors.destructive}
              className={
                above
                  ? "drop-shadow-[0_0_6px_hsl(var(--success)/0.7)]"
                  : "drop-shadow-[0_0_6px_hsl(var(--destructive)/0.7)]"
              }
            />
          );
        })}
      </svg>
    </ChartShell>
  );
}

function RevenueStackedChart({ data }: { data: MonthlySeriesPoint[] }) {
  const keys = ["upfront", "installments", "fees"] as const;
  const colors = [...revenueStackColors];
  const W4 = 520;
  const H4 = 200;
  const innerW = W4 - 56;
  const innerH = H4 - 40;
  const totals = data.map((d) => d.upfront + d.installments + d.fees);
  const y0 = innerH + 20;

  const barW = Math.max(innerW / Math.max(data.length, 1) - 8, 4);

  const stacks = data.map((d, i) => {
    const x = xAtIndex(i, data.length, innerW, 44);
    let yAcc = y0;
    const monthTotal = totals[i] || 0;
    const parts = keys.map((k, ki) => {
      const raw =
        monthTotal > 0 ? (finite(d[k]) / monthTotal) * innerH * 0.85 : 0;
      const h = finite(raw);
      yAcc -= h;
      return { k, h, y: yAcc, color: colors[ki], x, w: barW };
    });
    return { month: d.month, parts, x };
  });

  return (
    <ChartShell
      title="Facturación por tipo de pago"
      subtitle="Upfront · cuotas cobradas · fees"
      className="lg:col-span-2"
    >
      <svg viewBox={`0 0 ${W4} ${H4}`} className="w-full">
        {stacks.map((col) =>
          col.parts.map((p) =>
            p.h > 0 ? (
            <rect
              key={`${col.month}-${p.k}`}
              x={col.x - p.w / 2}
              y={p.y}
              width={p.w}
              height={p.h}
              fill={p.color}
              opacity={0.55}
              rx={2}
            />
            ) : null
          )
        )}
        {data.map((d, i) => (
          <text
            key={d.month}
            x={xAtIndex(i, data.length, innerW, 44)}
            y={H4 - 6}
            textAnchor="middle"
            fontSize="10"
            className="fill-muted-foreground"
          >
            {d.month}
          </text>
        ))}
      </svg>
      <div className="flex gap-4 text-xs justify-center">
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded bg-primary/60" /> Upfront
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded bg-[hsl(var(--info)/0.6)]" /> Cuotas
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded bg-[hsl(var(--chart-tertiary)/0.6)]" /> Fees
        </span>
      </div>
    </ChartShell>
  );
}
