"use client";

/**
 * El formulario de onboarding, paso por paso.
 *
 * Copia el comportamiento del formulario que Limitless usaba antes:
 *   · un paso por pantalla, con barra de avance;
 *   · no se avanza con una obligatoria vacía;
 *   · el avance se guarda solo en el navegador (es largo, y cerrar la pestaña
 *     no puede costar una hora de respuestas);
 *   · las preguntas largas sugieren mandar un audio por Discord.
 *
 * ⭐ Lo que decide si una respuesta vale es el servidor. La validación de acá
 * es la misma función (`validateOnboardingAnswers`), sólo para avisar antes.
 */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Label, Textarea, cn } from "@ai-coo/ui";
import { ArrowLeft, ArrowRight, Check, Loader2, Mic, Zap } from "lucide-react";
import { submitClientOnboardingAction } from "@/app/onboarding-cliente/actions";
import {
  isQuestionVisible,
  questionText,
  validateOnboardingAnswers,
  type OnboardingField,
  type OnboardingFormStep,
} from "@/lib/client-onboarding/form";
import { CREATOR_NAME_ERROR_KEY } from "@/lib/client-onboarding/links";
import type { CustomFieldValues } from "@/types/custom-fields";

const CONTROL_CLASS =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm";

type Borrador = { name: string; creator: string; answers: CustomFieldValues; step: number };

function leerBorrador(key: string): Borrador | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Borrador>;
    if (!data || typeof data !== "object" || typeof data.answers !== "object") return null;
    return {
      name: typeof data.name === "string" ? data.name : "",
      creator: typeof data.creator === "string" ? data.creator : "",
      answers: (data.answers ?? {}) as CustomFieldValues,
      step: typeof data.step === "number" ? data.step : 0,
    };
  } catch {
    return null;
  }
}

export function OnboardingForm({
  token,
  creatorName,
  steps,
  initial,
}: {
  token: string;
  /**
   * El creador dueño del link. Nulo en el link general: ahí se pregunta, y el
   * equipo asigna el envío después.
   */
  creatorName: string | null;
  steps: OnboardingFormStep[];
  /** Lo que ya está en la ficha: si vuelve a entrar, edita sobre eso. */
  initial: CustomFieldValues;
}) {
  const draftKey = `onboarding-cliente:${token}`;
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [creator, setCreator] = useState("");
  const general = creatorName === null;
  const [answers, setAnswers] = useState<CustomFieldValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // El borrador del navegador es más nuevo que lo que hay en la ficha.
  useEffect(() => {
    const borrador = leerBorrador(draftKey);
    if (borrador) {
      setName(borrador.name);
      setCreator(borrador.creator);
      setAnswers({ ...initial, ...borrador.answers });
      setStep(Math.min(Math.max(borrador.step, 0), steps.length - 1));
    }
    setDraftLoaded(true);
    // Sólo al montar: `initial` y `steps` vienen del servidor y no cambian.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    if (!draftLoaded || done) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ name, creator, answers, step }));
    } catch {
      // Sin almacenamiento (modo incógnito estricto) el formulario anda igual.
    }
  }, [draftKey, name, creator, answers, step, draftLoaded, done]);

  const actual = steps[step] ?? steps[0]!;
  const esUltimo = step === steps.length - 1;
  const avance = Math.round(((step + 1) / steps.length) * 100);

  const irA = (index: number) => {
    setStep(index);
    setError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validarPaso = (): boolean => {
    const result = validateOnboardingAnswers(actual.fields, answers);
    const faltaNombre = step === 0 && !name.trim();
    const faltaCreador = step === 0 && general && !creator.trim();
    if (result.ok && !faltaNombre && !faltaCreador) {
      setErrors({});
      setError(null);
      return true;
    }
    setErrors({
      ...(result.ok ? {} : result.errors),
      ...(faltaCreador ? { [CREATOR_NAME_ERROR_KEY]: "Completá esta respuesta." } : {}),
    });
    setError(
      faltaNombre
        ? "Poné tu nombre para seguir."
        : faltaCreador
          ? "Poné el nombre del creador para seguir."
          : "Hay respuestas para revisar."
    );
    return false;
  };

  const siguiente = () => {
    if (validarPaso()) irA(step + 1);
  };

  const enviar = async () => {
    if (!validarPaso()) return;
    if (!name.trim() || (general && !creator.trim())) {
      irA(0);
      setError(!name.trim() ? "Poné tu nombre para seguir." : "Poné el nombre del creador para seguir.");
      return;
    }
    setSending(true);
    setError(null);
    const result = await submitClientOnboardingAction({
      token,
      respondentName: name,
      creatorName: general ? creator : undefined,
      answers,
    });
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      if (result.errors) {
        setErrors(result.errors);
        // Lleva al primer paso con algo para revisar.
        const conError = result.errors[CREATOR_NAME_ERROR_KEY]
          ? 0
          : steps.findIndex((paso) =>
              paso.fields.some((field) => result.errors?.[field.key])
            );
        if (conError >= 0 && conError !== step) irA(conError);
      }
      return;
    }

    setDone(true);
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // Nada que limpiar.
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold">¡Listo, gracias!</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Tenemos todo lo que necesitamos para empezar. Si después querés cambiar
          algo, volvé a entrar a este mismo link.
        </p>
      </div>
    );
  }

  const visibles = actual.fields.filter((field) => isQuestionVisible(field, answers));

  return (
    <div ref={topRef} className="scroll-mt-6 overflow-hidden rounded-2xl border border-border">
      <div className="border-b border-border px-5 pb-5 pt-6 sm:px-8">
        <p className="text-sm text-muted-foreground">
          {general ? "Onboarding" : `Onboarding de ${creatorName}`}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wide text-primary">
            Paso {step + 1} de {steps.length}
          </span>
          <span className="text-muted-foreground">
            <span className="hidden sm:inline">Tu avance se guarda solo · </span>
            {avance}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${avance}%` }}
          />
        </div>
      </div>

      <div className="px-5 py-7 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{actual.step.title}</h1>
          {actual.step.priority ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Zap className="h-3 w-3" />
              Hacelo hoy
            </span>
          ) : null}
        </div>
        {actual.step.subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{actual.step.subtitle}</p>
        ) : null}

        <div className="mt-6 space-y-6">
          {step === 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-nombre" className="text-sm font-semibold">
                Tu nombre <span className="text-primary">*</span>
              </Label>
              <Input
                id="onboarding-nombre"
                value={name}
                maxLength={200}
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          ) : null}

          {step === 0 && general ? (
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-creador" className="text-sm font-semibold">
                Nombre del creador <span className="text-primary">*</span>
              </Label>
              <Input
                id="onboarding-creador"
                value={creator}
                maxLength={200}
                onChange={(event) => setCreator(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Si tenés varios, completá un formulario por cada creador.
              </p>
              {errors[CREATOR_NAME_ERROR_KEY] ? (
                <p className="text-xs text-destructive">{errors[CREATOR_NAME_ERROR_KEY]}</p>
              ) : null}
            </div>
          ) : null}

          {visibles.map((field) => (
            <Pregunta
              key={field.id}
              field={field}
              value={answers[field.key]}
              error={errors[field.key]}
              onChange={(value) => {
                setAnswers((current) => ({ ...current, [field.key]: value }));
                if (errors[field.key]) {
                  setErrors((current) => {
                    const resto = { ...current };
                    delete resto[field.key];
                    return resto;
                  });
                }
              }}
            />
          ))}
        </div>

        {error ? (
          <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => irA(step - 1)}
            disabled={step === 0 || sending}
            className={cn(step === 0 && "invisible")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Atrás
          </Button>
          {esUltimo ? (
            <Button type="button" onClick={enviar} disabled={sending}>
              {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              {sending ? "Enviando…" : "Enviar"}
            </Button>
          ) : (
            <Button type="button" onClick={siguiente}>
              Continuar
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Pregunta({
  field,
  value,
  error,
  onChange,
}: {
  field: OnboardingField;
  value: unknown;
  error: string | undefined;
  onChange: (value: unknown) => void;
}) {
  const id = `onboarding-${field.key}`;
  const texto = typeof value === "string" ? value : value == null ? "" : String(value);
  const opciones = field.options.filter((option) => !option.archived);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="block text-sm font-semibold leading-snug">
        {questionText(field)}
        {field.onboarding.required ? <span className="text-primary"> *</span> : null}
      </Label>

      {field.onboarding.audio ? (
        <p className="flex items-start gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-foreground">
          <Mic className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            <strong>Grabá un audio ({field.onboarding.audio})</strong> y mandalo al
            canal privado de Discord: hablando contás 10 veces más que
            escribiendo. Si preferís, escribilo acá abajo.
          </span>
        </p>
      ) : null}

      {field.fieldType === "select" ? (
        <select
          id={id}
          className={CONTROL_CLASS}
          value={texto}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Elegí una opción…</option>
          {opciones.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.fieldType === "multi_select" ? (
        <div className="flex flex-wrap gap-3">
          {opciones.map((option) => {
            const lista = Array.isArray(value) ? (value as string[]) : [];
            const marcada = lista.includes(option.value);
            return (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={marcada}
                  onChange={() =>
                    onChange(
                      marcada
                        ? lista.filter((v) => v !== option.value)
                        : [...lista, option.value]
                    )
                  }
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : field.fieldType === "date" ? (
        <Input id={id} type="date" value={texto} onChange={(e) => onChange(e.target.value)} />
      ) : field.fieldType === "number" || field.fieldType === "currency" ? (
        <Input
          id={id}
          inputMode="decimal"
          value={texto}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Textarea
          id={id}
          value={texto}
          rows={3}
          className="min-h-[88px] resize-y"
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {field.description ? (
        <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
          {field.description}
        </p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
