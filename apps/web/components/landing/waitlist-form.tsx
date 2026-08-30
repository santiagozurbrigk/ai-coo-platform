"use client";

import { useState } from "react";
import { Button, Input, Textarea, cn } from "@ai-coo/ui";
import { getStoredUtmData } from "@/components/landing/utm-capture";
import {
  MONTHLY_REVENUE_OPTIONS,
  TEAM_SIZE_OPTIONS,
} from "@/types/waitlist";

type FormState = "idle" | "loading" | "success" | "error";

const inputClassName =
  "landing-glass-input h-11 w-full text-white placeholder:text-white/40 focus-visible:ring-primary";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function OptionGroup({
  name,
  legend,
  options,
  value,
  onChange,
  disabled,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-white">{legend}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70 transition-colors hover:border-brand-500/30 has-[:checked]:border-brand-500/40 has-[:checked]:bg-brand-950/20"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              disabled={disabled}
              className="mt-0.5 accent-primary"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function WaitlistForm({
  submitLabel = "Quiero mi lugar",
  className,
}: {
  submitLabel?: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [operationalPain, setOperationalPain] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      setErrorMessage("Ingresá un email válido.");
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !monthlyRevenue ||
      !teamSize ||
      !operationalPain.trim() ||
      !whyNow.trim()
    ) {
      setState("error");
      setErrorMessage("Completá todos los campos del formulario.");
      return;
    }

    setState("loading");
    setErrorMessage(null);

    try {
      const utmData = getStoredUtmData();
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          instagram: instagram.trim() || undefined,
          monthly_revenue: monthlyRevenue,
          team_size: teamSize,
          operational_pain: operationalPain.trim(),
          why_now: whyNow.trim(),
          page_url:
            typeof window !== "undefined" ? window.location.href : undefined,
          ...utmData,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        eventId?: string;
      };

      if (!res.ok || !data.ok) {
        setState("error");
        setErrorMessage(data.error ?? "No pudimos registrarte. Intentá de nuevo.");
        return;
      }

      setState("success");
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setInstagram("");
      setMonthlyRevenue("");
      setTeamSize("");
      setOperationalPain("");
      setWhyNow("");
      setExpanded(false);

      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Lead", {}, { eventID: data.eventId });
      }
    } catch {
      setState("error");
      setErrorMessage("Error de conexión. Intentá de nuevo.");
    }
  }

  if (state === "success") {
    return (
      <p
        className={cn(
          "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-center text-sm text-emerald-400",
          className
        )}
        role="status"
      >
        ¡Estás en la lista! Te avisamos cuando abramos.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={cn("w-full max-w-lg space-y-4 text-left", className)}
    >
      <Input
        type="email"
        name="email"
        placeholder="tu@email.com"
        value={email}
        onFocus={() => setExpanded(true)}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        disabled={state === "loading"}
        required
        className={inputClassName}
        autoComplete="email"
      />

      <div
        style={{
          maxHeight: expanded ? "2000px" : "0px",
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease, opacity 0.3s ease",
        }}
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="text"
              name="first_name"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={state === "loading"}
              required={expanded}
              className={inputClassName}
              autoComplete="given-name"
            />
            <Input
              type="text"
              name="last_name"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={state === "loading"}
              required={expanded}
              className={inputClassName}
              autoComplete="family-name"
            />
          </div>

          <Input
            type="tel"
            name="phone"
            placeholder="Teléfono (WhatsApp)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={state === "loading"}
            required={expanded}
            className={inputClassName}
            autoComplete="tel"
          />

          <Input
            type="text"
            name="instagram"
            placeholder="@ de Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            disabled={state === "loading"}
            className={inputClassName}
            autoComplete="off"
          />

          <OptionGroup
            name="monthly_revenue"
            legend="1. ¿Cuánto factura tu negocio por mes?"
            options={MONTHLY_REVENUE_OPTIONS}
            value={monthlyRevenue}
            onChange={setMonthlyRevenue}
            disabled={state === "loading"}
          />

          <OptionGroup
            name="team_size"
            legend="2. ¿Cuántas personas hay en tu equipo?"
            options={TEAM_SIZE_OPTIONS}
            value={teamSize}
            onChange={setTeamSize}
            disabled={state === "loading"}
          />

          <div className="space-y-2">
            <label
              htmlFor="operational_pain"
              className="text-sm font-medium text-white"
            >
              3. ¿Cuál es tu mayor dolor operativo hoy?
            </label>
            <Textarea
              id="operational_pain"
              name="operational_pain"
              placeholder="Contanos qué te está frenando hoy..."
              value={operationalPain}
              onChange={(e) => setOperationalPain(e.target.value)}
              disabled={state === "loading"}
              required={expanded}
              rows={4}
              className="landing-glass-input min-h-[100px] w-full resize-y text-white placeholder:text-white/40 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="why_now" className="text-sm font-medium text-white">
              4. ¿Por qué ahora? ¿Qué te llevó a buscar una solución?
            </label>
            <Textarea
              id="why_now"
              name="why_now"
              placeholder="Una respuesta corta alcanza..."
              value={whyNow}
              onChange={(e) => setWhyNow(e.target.value)}
              disabled={state === "loading"}
              required={expanded}
              rows={3}
              className="landing-glass-input min-h-[80px] w-full resize-y text-white placeholder:text-white/40 focus-visible:ring-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={state === "loading" || !expanded}
            className="h-11 w-full rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover active:scale-95 disabled:opacity-60 sm:w-auto"
          >
            {state === "loading" ? "Enviando…" : submitLabel}
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
