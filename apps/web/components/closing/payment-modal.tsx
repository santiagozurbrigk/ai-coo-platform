"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  SteppedAlert,
  Textarea,
} from "@ai-coo/ui";
import { AlertTriangle } from "lucide-react";
import {
  PaymentReceiptDropzone,
  uploadPaymentReceiptFile,
} from "@/components/clients/payment-receipt-dropzone";
import { useFinanceData } from "@/providers";
import type { ClosePaymentPayload, PaymentPlatform } from "@/types/closing";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function platformLabel(
  id: string,
  platforms: { id: string; name: string; accountLabel?: string }[]
) {
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

function paidAmountForType(
  paymentType: ClosePaymentPayload["paymentType"],
  values: {
    totalAmount: string;
    installmentAmount: string;
    upfrontAmount: string;
  }
): number {
  if (paymentType === "upfront") return Number(values.totalAmount) || 0;
  if (paymentType === "installments") return Number(values.installmentAmount) || 0;
  return Number(values.upfrontAmount) || 0;
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
  onSubmit: (payload: ClosePaymentPayload) => Promise<void>;
}) {
  const { paymentPlatforms } = useFinanceData();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [clientName, setClientName] = useState(defaultName);
  const [offeredProduct, setOfferedProduct] = useState("");
  const [avatar, setAvatar] = useState("");
  const [mainPain, setMainPain] = useState("");
  const [objections, setObjections] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [paymentSourceId, setPaymentSourceId] = useState(
    paymentPlatforms[0]?.id ?? ""
  );
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
  const [feeFrequency, setFeeFrequency] = useState<"monthly" | "weekly">(
    "monthly"
  );
  const [fathomUrl, setFathomUrl] = useState("");

  useEffect(() => {
    if (open) {
      setClientName(defaultName);
      setProofFile(null);
      setError(null);
      if (!paymentSourceId && paymentPlatforms[0]) {
        setPaymentSourceId(paymentPlatforms[0].id);
      }
      if (!paymentDestId && paymentPlatforms[0]) {
        setPaymentDestId(paymentPlatforms[1]?.id ?? paymentPlatforms[0].id);
      }
    }
  }, [open, defaultName, paymentPlatforms, paymentSourceId, paymentDestId]);

  const handleSubmit = () => {
    const paidAmount = paidAmountForType(paymentType, {
      totalAmount,
      installmentAmount,
      upfrontAmount,
    });

    if (paidAmount <= 0) {
      setError("Ingresá el monto pagado.");
      return;
    }

    if (paymentType === "installments" && !firstDate) {
      setError("Ingresá la fecha de la primera cuota.");
      return;
    }

    if (!proofFile) {
      setError("El comprobante de pago es obligatorio.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const uploaded = await uploadPaymentReceiptFile(proofFile);
      if (!uploaded.ok) {
        setError(uploaded.error);
        return;
      }

      const source = paymentPlatforms.find((p) => p.id === paymentSourceId);
      const paymentDate =
        paymentType === "installments" && firstDate
          ? firstDate
          : new Date().toISOString().slice(0, 10);

      const payload: ClosePaymentPayload = {
        clientName: clientName.trim() || defaultName,
        platform: mapPlatformFromName(source?.name ?? "stripe"),
        paymentSourcePlatformId: paymentSourceId || paymentPlatforms[0]?.id,
        paymentDestinationPlatformId:
          paymentDestId || paymentPlatforms[1]?.id || paymentPlatforms[0]?.id,
        closedByName: "Martín López",
        paymentType,
        paidAmount,
        paymentDate,
        proof: {
          storagePath: uploaded.storagePath,
          mimeType: uploaded.mimeType,
          fileName: uploaded.fileName,
        },
        fathomUrl: fathomUrl.trim() || undefined,
        offeredProduct: offeredProduct.trim() || undefined,
        avatar: avatar.trim() || undefined,
        mainPain: mainPain.trim() || undefined,
        objections: objections.trim() || undefined,
        feedbackNotes: feedbackNotes.trim() || undefined,
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

      try {
        await onSubmit(payload);
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar el cierre");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,820px)] w-[min(96vw,1120px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:aspect-video">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle>Registrar pago y crear cliente</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {error ? (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            <section className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cliente y pago
              </p>
              <FormField label="Nombre completo del cliente">
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={pending}
                />
              </FormField>

              {paymentPlatforms.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Pago recibido desde">
                    <select
                      className={selectClass}
                      value={paymentSourceId}
                      onChange={(e) => setPaymentSourceId(e.target.value)}
                      disabled={pending}
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
                      disabled={pending}
                    >
                      {paymentPlatforms.map((p) => (
                        <option key={p.id} value={p.id}>
                          {platformLabel(p.id, paymentPlatforms)}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              ) : (
                <SteppedAlert
                  variant="warning"
                  title="Plataformas de pago sin configurar"
                  icon={<AlertTriangle className="h-4 w-4" />}
                >
                  Configura plataformas en Finanzas para rastrear origen y destino
                  del dinero.
                </SteppedAlert>
              )}

              <FormField label="Tipo de pago">
                <select
                  className={selectClass}
                  value={paymentType}
                  onChange={(e) =>
                    setPaymentType(e.target.value as typeof paymentType)
                  }
                  disabled={pending}
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
                      disabled={pending}
                    />
                  </FormField>
                  <FormField label="Comprobante de pago">
                    <PaymentReceiptDropzone
                      file={proofFile}
                      onFileChange={setProofFile}
                      disabled={pending}
                    />
                  </FormField>
                </>
              )}

              {paymentType === "installments" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Número de cuotas">
                    <Input
                      type="number"
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(e.target.value)}
                      disabled={pending}
                    />
                  </FormField>
                  <FormField label="Monto por cuota">
                    <Input
                      type="number"
                      value={installmentAmount}
                      onChange={(e) => setInstallmentAmount(e.target.value)}
                      disabled={pending}
                    />
                  </FormField>
                  <FormField label="Fecha primera cuota" className="sm:col-span-2">
                    <Input
                      type="date"
                      value={firstDate}
                      onChange={(e) => setFirstDate(e.target.value)}
                      disabled={pending}
                    />
                  </FormField>
                  <FormField label="Comprobante primera cuota" className="sm:col-span-2">
                    <PaymentReceiptDropzone
                      file={proofFile}
                      onFileChange={setProofFile}
                      disabled={pending}
                      label="Subir comprobante de la primera cuota"
                    />
                  </FormField>
                </div>
              )}

              {paymentType === "upfront_fee" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Monto upfront">
                    <Input
                      type="number"
                      value={upfrontAmount}
                      onChange={(e) => setUpfrontAmount(e.target.value)}
                      disabled={pending}
                    />
                  </FormField>
                  <FormField label="Monto fee">
                    <Input
                      type="number"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      disabled={pending}
                    />
                  </FormField>
                  <FormField label="Frecuencia del fee">
                    <select
                      className={selectClass}
                      value={feeFrequency}
                      onChange={(e) =>
                        setFeeFrequency(e.target.value as "monthly" | "weekly")
                      }
                      disabled={pending}
                    >
                      <option value="monthly">Mensual</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </FormField>
                  <FormField label="Comprobante" className="sm:col-span-2">
                    <PaymentReceiptDropzone
                      file={proofFile}
                      onFileChange={setProofFile}
                      disabled={pending}
                    />
                  </FormField>
                </div>
              )}

              <FormField label="Enlace Fathom de la llamada (opcional)">
                <Input
                  placeholder="https://fathom.video/..."
                  value={fathomUrl}
                  onChange={(e) => setFathomUrl(e.target.value)}
                  disabled={pending}
                />
              </FormField>
            </section>

            <section className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contexto del cierre
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Producto ofrecido">
                  <Input
                    placeholder="Ej. Programa High Ticket 12 semanas"
                    value={offeredProduct}
                    onChange={(e) => setOfferedProduct(e.target.value)}
                    disabled={pending}
                  />
                </FormField>
                <FormField label="Avatar">
                  <Input
                    placeholder="Ej. Coach 35–50 años, factura 20k/mes"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    disabled={pending}
                  />
                </FormField>
              </div>
              <FormField label="Dolor principal">
                <Textarea
                  rows={3}
                  placeholder="¿Qué problema urgente quería resolver?"
                  value={mainPain}
                  onChange={(e) => setMainPain(e.target.value)}
                  disabled={pending}
                />
              </FormField>
              <FormField label="Objeciones">
                <Textarea
                  rows={3}
                  placeholder="Precio, timing, pareja, falta de claridad…"
                  value={objections}
                  onChange={(e) => setObjections(e.target.value)}
                  disabled={pending}
                />
              </FormField>
              <FormField label="Feedback / Notas">
                <Textarea
                  rows={4}
                  placeholder="Resumen de la llamada, próximos pasos, acuerdos…"
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  disabled={pending}
                />
              </FormField>
            </section>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !proofFile}>
            {pending ? "Guardando…" : "Confirmar y añadir a Clientes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
