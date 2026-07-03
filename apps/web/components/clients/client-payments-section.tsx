"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  GlassPanel,
  Input,
} from "@ai-coo/ui";
import { ExternalLink, Plus } from "lucide-react";
import {
  addInstallmentPaymentAction,
  getClientPaymentReceiptUrlAction,
  listClientPaymentsAction,
} from "@/app/clients/payment-actions";
import {
  PaymentReceiptDropzone,
  uploadPaymentReceiptFile,
} from "@/components/clients/payment-receipt-dropzone";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { Client, ClientPayment } from "@/types/clients";

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function paymentLabel(payment: ClientPayment) {
  if (payment.installmentNumber != null) {
    return `Cuota ${payment.installmentNumber}`;
  }
  return "Pago único";
}

export function ClientPaymentsSection({ client }: { client: Client }) {
  const { updateClient } = usePlatformData();
  const { push } = useToast();
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const nextPending = useMemo(() => {
    if (client.paymentType !== "installments" || !client.installments?.length) {
      return null;
    }
    const paidNumbers = new Set(
      payments
        .map((p) => p.installmentNumber)
        .filter((n): n is number => n != null)
    );
    return (
      client.installments.find(
        (inst, i) => inst.status === "pending" && !paidNumbers.has(i + 1)
      ) ?? null
    );
  }, [client, payments]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listClientPaymentsAction(client.id).then((rows) => {
      if (!cancelled) {
        setPayments(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [client.id]);

  async function openReceipt(paymentId: string) {
    setOpeningId(paymentId);
    try {
      const res = await getClientPaymentReceiptUrlAction(paymentId);
      if (!res.success) {
        push({ title: "No se pudo abrir el comprobante", description: res.error });
        return;
      }
      window.open(res.data.url, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Historial de pagos</h2>
        {nextPending ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar cuota {nextPending.label}
          </Button>
        ) : null}
      </div>

      <GlassPanel className="p-5 text-sm">
        {loading ? (
          <p className="text-muted-foreground">Cargando pagos…</p>
        ) : payments.length === 0 ? (
          <p className="text-muted-foreground">
            Aún no hay comprobantes registrados para este cliente.
          </p>
        ) : (
          <ul className="space-y-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{paymentLabel(payment)}</p>
                  <p className="text-muted-foreground">
                    {payment.paymentDate} — {formatMoney(payment.amount)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  disabled={openingId === payment.id}
                  onClick={() => openReceipt(payment.id)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver comprobante
                </Button>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>

      {client.installments?.length ? (
        <GlassPanel className="p-5 text-sm space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Plan de cuotas</p>
          <ul className="space-y-2">
            {client.installments.map((inst) => (
              <li key={inst.id} className="flex flex-wrap justify-between gap-2">
                <span>
                  {inst.label} — {formatMoney(inst.amount)} —{" "}
                  {inst.status === "paid" ? "Pagada ✓" : "Pendiente"}
                  {inst.status === "paid" && inst.paidAt
                    ? ` — Cobrada: ${inst.paidAt}`
                    : ""}
                  {inst.status === "pending" && inst.dueDate
                    ? ` — Vence: ${inst.dueDate}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}

      {nextPending ? (
        <AddInstallmentPaymentDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          clientId={client.id}
          defaultAmount={nextPending.amount}
          installmentLabel={nextPending.label}
          onSuccess={(updatedClient, newPayments) => {
            void updateClient(updatedClient.id, {
              installments: updatedClient.installments,
            });
            setPayments(newPayments);
            push({
              title: "Cuota registrada",
              description: `${nextPending.label} guardada con comprobante`,
              variant: "success",
            });
          }}
        />
      ) : null}
    </section>
  );
}

function AddInstallmentPaymentDialog({
  open,
  onOpenChange,
  clientId,
  defaultAmount,
  installmentLabel,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  defaultAmount: number;
  installmentLabel: string;
  onSuccess: (client: Client, payments: ClientPayment[]) => void;
}) {
  const { push } = useToast();
  const [amount, setAmount] = useState(String(defaultAmount));
  const [paymentDate, setPaymentDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setAmount(String(defaultAmount));
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setFile(null);
      setError(null);
    }
  }, [open, defaultAmount]);

  function handleSubmit() {
    if (!file) {
      setError("El comprobante es obligatorio.");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }
    if (!paymentDate) {
      setError("Ingresá la fecha del pago.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const uploaded = await uploadPaymentReceiptFile(file, clientId);
      if (!uploaded.ok) {
        setError(uploaded.error);
        return;
      }

      const res = await addInstallmentPaymentAction({
        clientId,
        amount: parsedAmount,
        paymentDate,
        storagePath: uploaded.storagePath,
        mimeType: uploaded.mimeType,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      const refreshed = await listClientPaymentsAction(clientId);
      onSuccess(res.data.client, refreshed);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar {installmentLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <FormField label="Monto pagado">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={pending}
            />
          </FormField>
          <FormField label="Fecha del pago">
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={pending}
            />
          </FormField>
          <FormField label="Comprobante de pago">
            <PaymentReceiptDropzone
              file={file}
              onFileChange={setFile}
              disabled={pending}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !file}>
            {pending ? "Guardando…" : "Confirmar pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
