"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
} from "@ai-coo/ui";
import { useFinanceData } from "@/providers";
import type { ClosePaymentPayload, PaymentPlatform } from "@/types/closing";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function platformLabel(id: string, platforms: { id: string; name: string; accountLabel?: string }[]) {
  const p = platforms.find((x) => x.id === id);
  if (!p) return id;
  return p.accountLabel ? `${p.name} — ${p.accountLabel}` : p.name;
}

function mapPlatformFromName(name: string): PaymentPlatform {
  const n = name.toLowerCase();
  if (n.includes("stripe")) return "stripe";
  if (n.includes("mercado")) return "mercadopago";
  if (n.includes("paypal")) return "paypal";
  if (n.includes("bank") || n.includes("transfer")) return "bank_transfer";
  return "other";
}

export function PaymentModal({
  open,
  onOpenChange,
  defaultName,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  onSubmit: (payload: ClosePaymentPayload) => void;
}) {
  const { paymentPlatforms } = useFinanceData();
  const [clientName, setClientName] = useState(defaultName);
  const [paymentSourceId, setPaymentSourceId] = useState(paymentPlatforms[0]?.id ?? "");
  const [paymentDestId, setPaymentDestId] = useState(
    paymentPlatforms[1]?.id ?? paymentPlatforms[0]?.id ?? ""
  );
  const [paymentType, setPaymentType] = useState<
    "upfront" | "installments" | "upfront_fee"
  >("upfront");
  const [totalAmount, setTotalAmount] = useState("");
  const [installmentCount, setInstallmentCount] = useState("3");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [firstDate, setFirstDate] = useState("");
  const [upfrontAmount, setUpfrontAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeFrequency, setFeeFrequency] = useState<"monthly" | "weekly">("monthly");
  const [fathomUrl, setFathomUrl] = useState("");

  useEffect(() => {
    if (open) {
      setClientName(defaultName);
      if (!paymentSourceId && paymentPlatforms[0]) {
        setPaymentSourceId(paymentPlatforms[0].id);
      }
      if (!paymentDestId && paymentPlatforms[0]) {
        setPaymentDestId(paymentPlatforms[1]?.id ?? paymentPlatforms[0].id);
      }
    }
  }, [open, defaultName, paymentPlatforms, paymentSourceId, paymentDestId]);

  const handleSubmit = () => {
    const source = paymentPlatforms.find((p) => p.id === paymentSourceId);
    const payload: ClosePaymentPayload = {
      clientName: clientName.trim() || defaultName,
      platform: mapPlatformFromName(source?.name ?? "stripe"),
      paymentSourcePlatformId: paymentSourceId || paymentPlatforms[0]?.id,
      paymentDestinationPlatformId:
        paymentDestId || paymentPlatforms[1]?.id || paymentPlatforms[0]?.id,
      closedByName: "Martín López",
      paymentType,
      fathomUrl: fathomUrl.trim() || undefined,
    };
    if (paymentType === "upfront") {
      payload.totalAmount = Number(totalAmount) || 0;
    } else if (paymentType === "installments") {
      payload.installmentCount = Number(installmentCount) || 1;
      payload.installmentAmount = Number(installmentAmount) || 0;
      payload.firstInstallmentDate = firstDate;
    } else {
      payload.upfrontAmount = Number(upfrontAmount) || 0;
      payload.feeAmount = Number(feeAmount) || 0;
      payload.feeFrequency = feeFrequency;
    }
    onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar pago y crear cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField label="Nombre completo del cliente">
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </FormField>

          {paymentPlatforms.length > 0 ? (
            <>
              <FormField label="Pago recibido desde">
                <select
                  className={selectClass}
                  value={paymentSourceId}
                  onChange={(e) => setPaymentSourceId(e.target.value)}
                >
                  {paymentPlatforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {platformLabel(p.id, paymentPlatforms)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Destino del pago">
                <select
                  className={selectClass}
                  value={paymentDestId}
                  onChange={(e) => setPaymentDestId(e.target.value)}
                >
                  {paymentPlatforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {platformLabel(p.id, paymentPlatforms)}
                    </option>
                  ))}
                </select>
              </FormField>
            </>
          ) : (
            <p className="text-xs text-amber-500/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              Configura plataformas en Finanzas para rastrear origen y destino del dinero.
            </p>
          )}
          <FormField label="Tipo de pago">
            <select
              className={selectClass}
              value={paymentType}
              onChange={(e) =>
                setPaymentType(e.target.value as typeof paymentType)
              }
            >
              <option value="upfront">Pago único (upfront)</option>
              <option value="installments">Cuotas</option>
              <option value="upfront_fee">Upfront + fee</option>
            </select>
          </FormField>
          {paymentType === "upfront" && (
            <>
              <FormField label="Monto total pagado">
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </FormField>
              <FormField label="Comprobante de pago">
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                  Arrastra un archivo o haz clic para subir (mock)
                </div>
              </FormField>
            </>
          )}
          {paymentType === "installments" && (
            <>
              <FormField label="Número de cuotas">
                <Input
                  type="number"
                  value={installmentCount}
                  onChange={(e) => setInstallmentCount(e.target.value)}
                />
              </FormField>
              <FormField label="Monto por cuota">
                <Input
                  type="number"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                />
              </FormField>
              <FormField label="Fecha primera cuota">
                <Input
                  type="date"
                  value={firstDate}
                  onChange={(e) => setFirstDate(e.target.value)}
                />
              </FormField>
              <FormField label="Comprobante primera cuota">
                <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                  Subir comprobante (mock)
                </div>
              </FormField>
            </>
          )}
          {paymentType === "upfront_fee" && (
            <>
              <FormField label="Monto upfront">
                <Input
                  type="number"
                  value={upfrontAmount}
                  onChange={(e) => setUpfrontAmount(e.target.value)}
                />
              </FormField>
              <FormField label="Monto fee">
                <Input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                />
              </FormField>
              <FormField label="Frecuencia del fee">
                <select
                  className={selectClass}
                  value={feeFrequency}
                  onChange={(e) =>
                    setFeeFrequency(e.target.value as "monthly" | "weekly")
                  }
                >
                  <option value="monthly">Mensual</option>
                  <option value="weekly">Semanal</option>
                </select>
              </FormField>
              <FormField label="Comprobante">
                <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                  Subir comprobante (mock)
                </div>
              </FormField>
            </>
          )}
          <FormField label="Enlace Fathom de la llamada (opcional)">
            <Input
              placeholder="https://fathom.video/..."
              value={fathomUrl}
              onChange={(e) => setFathomUrl(e.target.value)}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Confirmar y añadir a Clientes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
