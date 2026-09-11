"use client";

/**
 * Las columnas configurables del cliente, en su ficha.
 *
 * ⭐ Acá vive el "Objetivo general" de las correcciones: una lista compartida
 * por toda la organización en vez de texto libre, para que el sistema pueda
 * responder "¿quiénes van a 50k?". La lista se configura en Campos
 * personalizados; esta pantalla sólo la carga.
 *
 * Si la organización no configuró ninguna columna de cliente, la sección **no se
 * muestra**: mandar a configurar algo desde la ficha de un cliente sería ruido,
 * y el lugar para configurarlo es su propia pantalla.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button, GlassPanel } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { usePlatformData } from "@/providers";
import {
  listClientFieldDefinitionsAction,
  updateClientCustomFieldsAction,
} from "@/app/clients/client-custom-fields-actions";
import { FieldValueInput } from "@/components/clients/custom-fields/field-value-input";
import { FieldValueCell } from "@/components/clients/custom-fields/field-value-cell";
import { activeFields, fieldsForValues, hasValue } from "@/lib/custom-fields";
import type { CustomFieldValues, FieldDefinition } from "@/types/custom-fields";
import type { Client } from "@/types/clients";

export function ClientCustomFieldsSection({ client }: { client: Client }) {
  const { push } = useToast();
  const { refreshClients } = usePlatformData();

  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<CustomFieldValues>(client.custom ?? {});
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    listClientFieldDefinitionsAction()
      .then((next) => {
        if (alive) setFields(next);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // El borrador se resincroniza si el cliente cambia por fuera (otra pestaña,
  // un refresco del provider). Sin esto, quedaría mostrando lo viejo.
  useEffect(() => {
    setDraft(client.custom ?? {});
  }, [client.custom]);

  /** Las columnas que se ofrecen para cargar. */
  const offered = useMemo(() => activeFields(fields), [fields]);

  /**
   * Las archivadas que este cliente igual tiene cargadas. Se muestran de sólo
   * lectura: la columna dejó de ofrecerse, pero el dato sigue siendo cierto y
   * esconderlo sería borrarlo de la vista sin que nadie lo decida.
   */
  const archivedWithValue = useMemo(
    () =>
      fieldsForValues(fields, client.custom).filter(
        (field) => field.archivedAt !== null
      ),
    [fields, client.custom]
  );

  const dirty = useMemo(() => {
    const saved = client.custom ?? {};
    const keys = new Set([...Object.keys(saved), ...Object.keys(draft)]);
    for (const key of keys) {
      if (JSON.stringify(saved[key] ?? null) !== JSON.stringify(draft[key] ?? null)) {
        return true;
      }
    }
    return false;
  }, [client.custom, draft]);

  if (loading || (offered.length === 0 && archivedWithValue.length === 0)) {
    return null;
  }

  function save() {
    startTransition(async () => {
      const result = await updateClientCustomFieldsAction({
        clientId: client.id,
        values: draft,
      });

      if (!result.success) {
        push({ title: "No se pudo guardar", description: result.error });
        return;
      }

      setDraft(result.data);
      await refreshClients();
      push({ title: "Datos del cliente guardados", variant: "success" });
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Datos del cliente</h2>
        {dirty ? (
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        ) : null}
      </div>

      <GlassPanel className="space-y-4 p-5">
        {offered.map((field) => (
          <FieldValueInput
            key={field.id}
            field={field}
            value={draft[field.key]}
            onChange={(value) =>
              setDraft((current) => ({ ...current, [field.key]: value }))
            }
          />
        ))}

        {archivedWithValue.length > 0 ? (
          <div className="space-y-2 border-t border-border/60 pt-4">
            <p className="text-xs text-muted-foreground">
              Columnas archivadas que este cliente tiene cargadas. No se editan,
              y se conservan al guardar.
            </p>
            {archivedWithValue.map((field) =>
              hasValue(client.custom?.[field.key]) ? (
                <div key={field.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{field.label}:</span>
                  <FieldValueCell field={field} value={client.custom?.[field.key]} />
                </div>
              ) : null
            )}
          </div>
        ) : null}
      </GlassPanel>
    </section>
  );
}
