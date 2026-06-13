"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@ai-coo/ui";
import {
  Bell,
  Building2,
  Globe,
  Lock,
  Palette,
  User,
} from "lucide-react";
import { saveGeneralOrganizationSettingsAction } from "@/app/settings/actions";
import { ClaudeApiKeySettings } from "./claude-api-key-settings";
import { useToast } from "@/providers/toast-provider";
import { es } from "@/lib/locale/es";
import { formatRelativeTime } from "@/lib/format";
import type { SettingsInitialData } from "@/lib/settings/initial-data";
import { FieldLabel } from "./field-label";
import { NotificationToggle } from "./notification-toggle";
import { SectionHeader } from "./section-header";
import { SettingsFormActions } from "./settings-form-actions";
import {
  SettingsTabNav,
  type SettingsTabId,
} from "./settings-tab-nav";
import { SignOutButton } from "./sign-out-button";
import { ThemeSelector } from "./theme-selector";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type NotificationPrefs = {
  weeklyReport: boolean;
  riskAlerts: boolean;
  syncFailures: boolean;
  newBookings: boolean;
};

const NOTIFICATION_DEFAULTS: NotificationPrefs = {
  weeklyReport: true,
  riskAlerts: true,
  syncFailures: false,
  newBookings: false,
};

export function SettingsForm({
  initialData,
}: {
  initialData: SettingsInitialData;
}) {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");

  const [orgName, setOrgName] = useState(initialData.orgName);
  const [industry, setIndustry] = useState(initialData.industry);
  const [websiteUrl, setWebsiteUrl] = useState(initialData.websiteUrl);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [displayName, setDisplayName] = useState(initialData.displayName);
  const [email, setEmail] = useState(initialData.email);
  const [notifications, setNotifications] = useState({
    ...NOTIFICATION_DEFAULTS,
  });

  const resetForm = () => {
    setOrgName(initialData.orgName);
    setIndustry(initialData.industry);
    setWebsiteUrl(initialData.websiteUrl);
    setSaveError(null);
    setDisplayName(initialData.displayName);
    setEmail(initialData.email);
    setNotifications({ ...NOTIFICATION_DEFAULTS });
  };

  const handleSave = () => {
    setSaveError(null);
    startSave(async () => {
      const result = await saveGeneralOrganizationSettingsAction({
        orgName,
        websiteUrl,
      });
      if (result.success) {
        push({
          title: es.flow.settingsSaved,
          description: es.flow.settingsSavedDesc,
          variant: "success",
        });
      } else {
        setSaveError(result.error);
        push({
          title: "No se guardaron los cambios",
          description: result.error,
        });
      }
    });
  };

  const lastAccessLabel = initialData.lastSignInAt
    ? formatRelativeTime(initialData.lastSignInAt)
    : "hace unos minutos";

  return (
    <div className="max-w-2xl space-y-8">
      <SettingsTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "general" && (
        <div className="space-y-8 pt-2">
          <section>
            <SectionHeader icon={Building2} label="Organización" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="org-name">Nombre de la empresa</FieldLabel>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel htmlFor="industry">Industria</FieldLabel>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label
                htmlFor="website-url"
                className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                URL de tu sitio web / landing
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="website-url"
                  placeholder="https://tudominio.com"
                  className="pl-9"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Se usa como base para generar tus links de UTM en Marketing. Si
                no la configurás, los links van a apuntar a
                optimizatucontrol.com.
              </p>
            </div>
            {saveError ? (
              <p className="mt-2 text-sm text-red-400" role="alert">
                {saveError}
              </p>
            ) : null}
          </section>

          <section>
            <SectionHeader icon={Palette} label="Apariencia" />
            <ThemeSelector />
          </section>

          <SettingsFormActions
            onSave={handleSave}
            onCancel={resetForm}
            isPending={saving}
          />
        </div>
      )}

      {activeTab === "perfil" && (
        <div className="space-y-8 pt-2">
          <section>
            <SectionHeader icon={User} label="Perfil" />
            <div className="mb-6 flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
                style={{ backgroundColor: "#7C3AED" }}
              >
                {getInitials(displayName)}
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG o JPG · mín. 400×400px
                </p>
                <Button type="button" variant="outline" size="sm">
                  Subir foto
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="display-name">
                  Nombre para mostrar
                </FieldLabel>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </section>

          <SettingsFormActions onSave={handleSave} onCancel={resetForm} />
        </div>
      )}

      {activeTab === "notificaciones" && (
        <div className="pt-2">
          <SectionHeader icon={Bell} label="Notificaciones" />
          <NotificationToggle
            label="Reporte semanal listo"
            description="Notificación cuando el reporte operacional esté generado"
            checked={notifications.weeklyReport}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, weeklyReport: checked }))
            }
          />
          <NotificationToggle
            label="Alertas de riesgo"
            description="Cuando la IA detecta un riesgo operacional crítico"
            checked={notifications.riskAlerts}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, riskAlerts: checked }))
            }
          />
          <NotificationToggle
            label="Fallos de sincronización"
            description="Integraciones con errores o desconectadas"
            checked={notifications.syncFailures}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, syncFailures: checked }))
            }
          />
          <NotificationToggle
            label="Nuevos bookings detectados"
            description="Cuando la IA detecta una reserva en el inbox de ventas"
            checked={notifications.newBookings}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, newBookings: checked }))
            }
          />
          <SettingsFormActions onSave={handleSave} onCancel={resetForm} />
        </div>
      )}

      {activeTab === "ia" && (
        <div className="space-y-8 pt-2">
          <ClaudeApiKeySettings initialStatus={initialData.claudeApiKeyStatus} />
        </div>
      )}

      {activeTab === "seguridad" && (
        <div className="space-y-8 pt-2">
          <section>
            <SectionHeader icon={Lock} label="Sesión activa" />
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/40 px-4 py-4 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  Sesión activa
                </p>
                <p className="text-xs text-muted-foreground">
                  {email} · último acceso {lastAccessLabel}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Activa
              </span>
            </div>
          </section>

          <section className="border-t border-red-500/20 pt-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-red-500">
              Zona de peligro
            </p>
            <SignOutButton variant="danger" />
          </section>
        </div>
      )}
    </div>
  );
}
