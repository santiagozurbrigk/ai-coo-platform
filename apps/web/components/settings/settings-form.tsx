"use client";

import { Button, FormField, Input } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { es } from "@/lib/locale/es";
import { SettingsSection } from "./settings-section";
import { SignOutButton } from "./sign-out-button";

export function SettingsForm() {
  const { push } = useToast();

  return (
    <div className="max-w-2xl space-y-6">
      <SettingsSection
        title="Organización"
        description="Perfil de la empresa visible en reportes"
      >
        <div className="space-y-4">
          <FormField label="Nombre de la empresa">
            <Input defaultValue="Acme Coaching Co." />
          </FormField>
          <FormField label="Industria">
            <Input defaultValue="Infoproducto / Coaching" />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection title="Perfil">
        <div className="space-y-4">
          <FormField label="Nombre para mostrar">
            <Input defaultValue="Nombre Fundador" />
          </FormField>
          <FormField label="Correo">
            <Input defaultValue="founder@acme.co" type="email" />
          </FormField>
        </div>
      </SettingsSection>

      <SettingsSection title="Notificaciones">
        <p className="text-sm text-muted-foreground">
          Reporte semanal listo · Alertas de riesgo · Fallos de sincronización
        </p>
      </SettingsSection>

      <SettingsSection title="Sesión" description="Cuenta conectada a Supabase">
        <SignOutButton />
      </SettingsSection>

      <Button
        type="button"
        onClick={() =>
          push({
            title: es.flow.settingsSaved,
            description: es.flow.settingsSavedDesc,
            variant: "success",
          })
        }
      >
        {es.common.save}
      </Button>
    </div>
  );
}
