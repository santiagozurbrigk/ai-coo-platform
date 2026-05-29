"use client";

import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  GlassPanel,
  Input,
} from "@ai-coo/ui";
import { PageHeader } from "@/components/shared/page-header";
import { useFinanceData } from "@/providers";
import { formatMoney, monthlyEquivalent } from "@/lib/finance/format";
import type { ExpenseCategory, FixedExpense, Subscription } from "@/types/expenses";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  infrastructure: "Infraestructura",
  professional: "Servicios profesionales",
  marketing: "Marketing",
  tools: "Herramientas y software",
  other: "Otro",
};

const SUB_SUGGESTIONS = [
  "Notion",
  "Slack",
  "Zoom",
  "Fathom",
  "Loom",
  "Airtable",
  "Make",
  "Google Workspace",
  "Calendly",
  "Este software",
];

export function ExpensesOverview() {
  const {
    expensesSummary,
    fixedExpenses,
    subscriptions,
    teamCompensation,
  } = useFinanceData();
  const s = expensesSummary;

  const fixedTotal = fixedExpenses.reduce(
    (sum, e) => sum + monthlyEquivalent(e.amount, e.frequency),
    0
  );
  const subsTotal = subscriptions.reduce(
    (sum, sub) => sum + monthlyEquivalent(sub.amount, sub.billingCycle),
    0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gastos"
        description="Configura gastos fijos, suscripciones y compensación del equipo — alimentan Cash Collected en Finanzas"
      />

      <GlassPanel className="p-6">
        <p className="text-sm text-muted-foreground">Total gastos este mes</p>
        <p className="text-3xl font-semibold mt-1 tabular-nums">
          {formatMoney(s.totalMonthly)}
        </p>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <Row label="Gastos fijos" value={formatMoney(s.fixedMonthly)} />
          <Row label="Suscripciones" value={formatMoney(s.subscriptionsMonthly)} />
          <Row label="Equipo (fijos)" value={formatMoney(s.teamFixedMonthly)} />
          <Row
            label="Equipo (comisiones)"
            value={formatMoney(s.teamCommissionsMonthly)}
          />
        </div>
        <div className="border-t border-border mt-4 pt-3 flex justify-between font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(s.totalMonthly)}</span>
        </div>
      </GlassPanel>

      <FixedExpensesSection
        expenses={fixedExpenses}
        totalMonthly={fixedTotal}
      />
      <SubscriptionsSection subscriptions={subscriptions} totalMonthly={subsTotal} />
      <TeamCompensationSection members={teamCompensation} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function FixedExpensesSection({
  expenses,
  totalMonthly,
}: {
  expenses: FixedExpense[];
  totalMonthly: number;
}) {
  const { addFixedExpense, removeFixedExpense } = useFinanceData();
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Gastos fijos"
        summary={`Total gastos fijos al mes: ${formatMoney(totalMonthly)}`}
        onAdd={() => setOpen(true)}
      />
      <ExpenseTable
        columns={["Nombre", "Categoría", "Monto", "Frecuencia", "Equiv. mensual", "Estado", ""]}
        rows={expenses.map((e) => [
          e.name,
          CATEGORY_LABEL[e.category],
          formatMoney(e.amount, e.currency),
          e.frequency === "monthly" ? "Mensual" : "Anual",
          formatMoney(monthlyEquivalent(e.amount, e.frequency), e.currency),
          e.status === "active" ? (
            <Badge variant="success">Activo</Badge>
          ) : (
            <Badge variant="secondary">Pausado</Badge>
          ),
          <ActionButtons
            key={e.id}
            onDelete={() => removeFixedExpense(e.id)}
          />,
        ])}
      />
      <FixedExpenseModal
        open={open}
        onOpenChange={setOpen}
        onSave={(data) => {
          void addFixedExpense(data).then(() => setOpen(false));
        }}
      />
    </section>
  );
}

function SubscriptionsSection({
  subscriptions,
  totalMonthly,
}: {
  subscriptions: Subscription[];
  totalMonthly: number;
}) {
  const { addSubscription, removeSubscription } = useFinanceData();
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Suscripciones"
        summary={`Total suscripciones al mes: ${formatMoney(totalMonthly)}`}
        onAdd={() => setOpen(true)}
      />
      <ExpenseTable
        columns={["Herramienta", "Monto", "Ciclo", "Equiv. mensual", ""]}
        rows={subscriptions.map((sub) => [
          <span key={sub.id} className="font-medium">
            {sub.name}
          </span>,
          formatMoney(sub.amount, sub.currency),
          sub.billingCycle === "monthly" ? "Mensual" : "Anual",
          formatMoney(monthlyEquivalent(sub.amount, sub.billingCycle), sub.currency),
          <ActionButtons key={sub.id} onDelete={() => removeSubscription(sub.id)} />,
        ])}
      />
      <SubscriptionModal
        open={open}
        onOpenChange={setOpen}
        onSave={(data) => {
          void addSubscription(data).then(() => setOpen(false));
        }}
      />
    </section>
  );
}

function TeamCompensationSection({
  members,
}: {
  members: {
    id: string;
    memberName: string;
    roleLabel: string;
    hasFixed: boolean;
    fixedMonthly?: number;
    hasCommission: boolean;
    commissionSummary?: string;
    estimatedThisMonth: number;
  }[];
}) {
  const fixedTotal = members.reduce(
    (s, m) => s + (m.hasFixed ? m.fixedMonthly ?? 0 : 0),
    0
  );
  const commTotal = members.reduce(
    (s, m) => s + (m.hasCommission ? m.estimatedThisMonth - (m.fixedMonthly ?? 0) : 0),
    0
  );

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Gastos de equipo</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Total costo equipo este mes: {formatMoney(fixedTotal + commTotal)} · Fijos:{" "}
          {formatMoney(fixedTotal)} · Comisiones: {formatMoney(commTotal)}
        </p>
      </div>
      <div className="space-y-3">
        {members.map((m) => (
          <GlassPanel key={m.id} className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold">
              {m.memberName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{m.memberName}</p>
              <p className="text-xs text-muted-foreground">{m.roleLabel}</p>
            </div>
            <Badge variant="outline">
              {m.hasFixed && m.hasCommission
                ? "Fijo + Comisión"
                : m.hasFixed
                  ? "Fijo"
                  : "Comisión"}
            </Badge>
            {m.hasFixed && (
              <p className="text-sm tabular-nums">
                Fijo: {formatMoney(m.fixedMonthly ?? 0)}/mes
              </p>
            )}
            {m.commissionSummary && (
              <p className="text-xs text-muted-foreground">{m.commissionSummary}</p>
            )}
            <p className="text-sm font-semibold tabular-nums ml-auto">
              Est. mes: {formatMoney(m.estimatedThisMonth)}
            </p>
            <Button size="sm" variant="outline">
              Editar
            </Button>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  summary,
  onAdd,
}: {
  title: string;
  summary: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{summary}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onAdd}>
        + Añadir
      </Button>
    </div>
  );
}

function ExpenseTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            {columns.map((c) => (
              <th key={c} className="px-4 py-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionButtons({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="ghost">
        Editar
      </Button>
      <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
        Eliminar
      </Button>
    </div>
  );
}

function FixedExpenseModal({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (e: Omit<FixedExpense, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "annual">("monthly");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogDescription className="sr-only">
            Formulario para registrar un gasto fijo recurrente.
          </DialogDescription>
          <DialogTitle>Añadir gasto fijo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <FormField label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Categoría">
            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Monto (USD)">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
          <FormField label="Frecuencia">
            <select
              className={selectClass}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as typeof frequency)}
            >
              <option value="monthly">Mensual</option>
              <option value="annual">Anual</option>
            </select>
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              onSave({
                name: name.trim() || "Gasto",
                category,
                amount: Number(amount) || 0,
                currency: "USD",
                frequency,
                status: "active",
              })
            }
          >
            Guardar gasto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionModal({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (s: Omit<Subscription, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogDescription className="sr-only">
            Formulario para registrar una suscripción de software o servicio.
          </DialogDescription>
          <DialogTitle>Añadir suscripción</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <FormField label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <div className="mt-2 flex flex-wrap gap-1">
              {SUB_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="text-xs rounded border px-2 py-0.5 hover:bg-muted"
                  onClick={() => setName(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Monto mensual">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
        </div>
        <DialogFooter>
          <Button
            onClick={() =>
              onSave({
                name: name.trim() || "Suscripción",
                amount: Number(amount) || 0,
                currency: "USD",
                billingCycle: "monthly",
              })
            }
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
