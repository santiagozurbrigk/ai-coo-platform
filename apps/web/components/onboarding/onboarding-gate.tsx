"use client";

/**
 * Gate de onboarding: los tres pasos que una organización nueva no puede
 * saltear. Ver docs/ONBOARDING_PLAN.md §1.
 *
 * Cada paso guarda contra las Server Actions que ya existían, así que salir a
 * mitad de camino no pierde lo cargado: al volver, el paso aparece completo y
 * el wizard arranca en el primero que falte.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Package, UserRound } from "lucide-react";
import { Button, Input, Label, Textarea, cn } from "@ai-coo/ui";
import {
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/constants/organization-options";
import { markWelcomePending } from "@/lib/onboarding/welcome-storage";
import { useToast } from "@/providers/toast-provider";
import { paths } from "@/routes/paths";
import {
  completeOnboardingGateAction,
  saveGateAvatarAction,
  saveGateBusinessAction,
  saveGateOfferAction,
  type OnboardingGateDefaults,
} from "@/app/onboarding/actions";

type StepIndex = 0 | 1 | 2;

const STEPS = [
  {
    icon: Building2,
    title: "Tu negocio",
    /* El "por qué" no es relleno: es lo que hace que alguien complete el paso
       en vez de poner cualquier cosa para pasar de pantalla. */
    why: "La moneda y la zona horaria definen cómo se suma y se agrupa cada número del sistema. Cambiarlas más adelante no corrige lo que ya se haya cargado.",
  },
  {
    icon: Package,
    title: "Tu oferta principal",
    why: "Es contra qué se miden los embudos y de dónde salen el ticket y el LTV. Después vas a poder cargar el resto de tu escalera de valor.",
  },
  {
    icon: UserRound,
    title: "Tu cliente ideal",
    why: "Es contra quién razona el agente cuando analiza tus llamadas y tu contenido. Sin esto sus respuestas son genéricas.",
  },
] as const;

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function OnboardingGate({
  defaults,
  initialStep,
}: {
  defaults: OnboardingGateDefaults;
  /** Primer paso sin cumplir: quien ya cargó la oferta no la vuelve a escribir. */
  initialStep: StepIndex;
}) {
  const router = useRouter();
  const { push: pushToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<StepIndex>(initialStep);
  const [error, setError] = useState<string | null>(null);

  const [business, setBusiness] = useState({
    orgName: defaults.orgName,
    industry: defaults.industry,
    websiteUrl: defaults.websiteUrl,
    timezone: defaults.timezone,
    currency: defaults.currency,
    language: defaults.language,
  });
  const [offer, setOffer] = useState({ name: "", description: "", price: "" });
  const [avatar, setAvatar] = useState({
    name: "",
    mainPain: "",
    occupation: "",
  });

  const Icon = STEPS[step].icon;

  const canContinue = useMemo(() => {
    if (step === 0) {
      return Boolean(
        business.orgName.trim() && business.currency && business.timezone
      );
    }
    if (step === 1) return Boolean(offer.name.trim());
    return Boolean(avatar.name.trim() && avatar.mainPain.trim());
  }, [step, business, offer, avatar]);

  function handleNext() {
    setError(null);

    startTransition(async () => {
      if (step === 0) {
        const res = await saveGateBusinessAction({
          orgName: business.orgName.trim(),
          industry: business.industry.trim() || undefined,
          websiteUrl: business.websiteUrl.trim(),
          timezone: business.timezone,
          currency: business.currency,
          language: business.language,
        });
        if (!res.success) return setError(res.error);
        return setStep(1);
      }

      if (step === 1) {
        const parsedPrice = Number(offer.price);
        const res = await saveGateOfferAction({
          name: offer.name.trim(),
          description: offer.description.trim() || undefined,
          // Un precio vacío o mal tipeado se guarda como ausente, no como cero:
          // una oferta sin precio conocido no es una oferta gratis.
          price:
            offer.price.trim() && Number.isFinite(parsedPrice)
              ? parsedPrice
              : undefined,
          currency: business.currency,
        });
        if (!res.success) return setError(res.error);
        return setStep(2);
      }

      const avatarRes = await saveGateAvatarAction({
        name: avatar.name.trim(),
        mainPain: avatar.mainPain.trim(),
        occupation: avatar.occupation.trim() || undefined,
      });
      if (!avatarRes.success) return setError(avatarRes.error);

      const done = await completeOnboardingGateAction();
      if (!done.success) return setError(done.error);

      // La animación de bienvenida se reproduce una sola vez, en la primera
      // visita al panel después de terminar acá.
      markWelcomePending();
      pushToast({
        title: "Todo listo",
        description: "Tu espacio está configurado.",
        variant: "success",
      });
      router.replace(paths.platform.dashboard);
    });
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, index) => (
            <div key={s.title} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  index < step && "border-primary bg-primary text-primary-foreground",
                  index === step && "border-primary text-primary",
                  index > step && "border-border text-muted-foreground"
                )}
              >
                {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1 transition-colors",
                    index < step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight">
                {STEPS[step].title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {STEPS[step].why}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <>
                <div>
                  <Label htmlFor="gate-org-name">Nombre de la empresa</Label>
                  <Input
                    id="gate-org-name"
                    value={business.orgName}
                    onChange={(e) =>
                      setBusiness((b) => ({ ...b, orgName: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="gate-industry">Industria</Label>
                    <Input
                      id="gate-industry"
                      placeholder="Infoproductos, consultoría…"
                      value={business.industry}
                      onChange={(e) =>
                        setBusiness((b) => ({ ...b, industry: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="gate-website">Sitio web</Label>
                    <Input
                      id="gate-website"
                      placeholder="tunegocio.com"
                      value={business.websiteUrl}
                      onChange={(e) =>
                        setBusiness((b) => ({ ...b, websiteUrl: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="gate-currency">Moneda</Label>
                    <select
                      id="gate-currency"
                      className={selectClass}
                      value={business.currency}
                      onChange={(e) =>
                        setBusiness((b) => ({ ...b, currency: e.target.value }))
                      }
                    >
                      {CURRENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="gate-timezone">Zona horaria</Label>
                    <select
                      id="gate-timezone"
                      className={selectClass}
                      value={business.timezone}
                      onChange={(e) =>
                        setBusiness((b) => ({ ...b, timezone: e.target.value }))
                      }
                    >
                      {TIMEZONE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="gate-language">Idioma</Label>
                    <select
                      id="gate-language"
                      className={selectClass}
                      value={business.language}
                      onChange={(e) =>
                        setBusiness((b) => ({ ...b, language: e.target.value }))
                      }
                    >
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="gate-offer-name">Nombre de la oferta</Label>
                  <Input
                    id="gate-offer-name"
                    placeholder="Mentoría 1:1, Programa de 12 semanas…"
                    value={offer.name}
                    onChange={(e) =>
                      setOffer((o) => ({ ...o, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gate-offer-price">
                    Precio en {business.currency}{" "}
                    <span className="font-normal text-muted-foreground">
                      · opcional
                    </span>
                  </Label>
                  <Input
                    id="gate-offer-price"
                    inputMode="decimal"
                    placeholder="2000"
                    value={offer.price}
                    onChange={(e) =>
                      setOffer((o) => ({ ...o, price: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gate-offer-description">
                    Qué incluye{" "}
                    <span className="font-normal text-muted-foreground">
                      · opcional
                    </span>
                  </Label>
                  <Textarea
                    id="gate-offer-description"
                    rows={3}
                    value={offer.description}
                    onChange={(e) =>
                      setOffer((o) => ({ ...o, description: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="gate-avatar-name">Cómo lo llamás</Label>
                  <Input
                    id="gate-avatar-name"
                    placeholder="Founder de agencia, coach en crecimiento…"
                    value={avatar.name}
                    onChange={(e) =>
                      setAvatar((a) => ({ ...a, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gate-avatar-pain">Su problema principal</Label>
                  <Textarea
                    id="gate-avatar-pain"
                    rows={3}
                    placeholder="Qué es lo que más le duele hoy y lo trae a buscarte."
                    value={avatar.mainPain}
                    onChange={(e) =>
                      setAvatar((a) => ({ ...a, mainPain: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gate-avatar-occupation">
                    A qué se dedica{" "}
                    <span className="font-normal text-muted-foreground">
                      · opcional
                    </span>
                  </Label>
                  <Input
                    id="gate-avatar-occupation"
                    value={avatar.occupation}
                    onChange={(e) =>
                      setAvatar((a) => ({ ...a, occupation: e.target.value }))
                    }
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1) as StepIndex)}
              disabled={step === 0 || pending}
            >
              Atrás
            </Button>
            <Button type="button" onClick={handleNext} disabled={!canContinue || pending}>
              {pending
                ? "Guardando…"
                : step === STEPS.length - 1
                  ? "Terminar"
                  : "Continuar"}
            </Button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Paso {step + 1} de {STEPS.length} · Todo esto se puede editar después
        </p>
      </div>
    </div>
  );
}
