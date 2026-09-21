"use client";

/**
 * Los tres apartados de información del cliente: Marketing, Ventas y Sistemas.
 *
 * ⭐ Los campos **no están horneados en el código**. Salen de las columnas
 * configurables que cada organización define, agrupadas por su sección. El
 * pedido traía una lista de 22 campos concretos y la tentación era escribirlos
 * acá; se cargan con un botón desde Campos personalizados, y así renombrarlos,
 * archivarlos o agregar otros no necesita a nadie que toque código.
 *
 * ⭐ Una solapa sin campos configurados no aparece. Una organización que sólo
 * usa Marketing ve una sola solapa, no tres con dos vacías.
 */

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  cn,
} from "@ai-coo/ui";
import {
  Check,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Layers,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { updateClientCustomFieldsAction } from "@/app/clients/client-custom-fields-actions";
import { ACCION_DE_FILA, FichaCard } from "@/components/clients/ficha-section";
import { FieldValueCell } from "@/components/clients/custom-fields/field-value-cell";
import { FieldValueInput } from "@/components/clients/custom-fields/field-value-input";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import {
  FIELD_SECTION_LABEL,
  FIELD_SECTIONS,
  type FieldDefinition,
  type FieldSection,
} from "@/types/custom-fields";
import type { Client } from "@/types/clients";

/**
 * ¿Lo que pegaron es un link?
 *
 * ⭐ El founder lo dijo explícito: «puede ser un link a un documento, a un
 * tablero de Miro, o texto escrito». Un link pegado como texto plano obliga a
 * copiarlo y pegarlo en otra pestaña; detectarlo cuesta una función y ahorra ese
 * viaje cada vez.
 */
function comoLink(value: unknown): { href: string; label: string } | null {
  if (typeof value !== "string") return null;
  const texto = value.trim();
  if (!/^https?:\/\/\S+$/i.test(texto)) return null;

  try {
    const url = new URL(texto);
    return {
      href: texto,
      // El dominio alcanza para reconocerlo —«miro.com», «docs.google.com»— y
      // entra en una columna angosta; la URL entera no.
      label: url.hostname.replace(/^www\./, ""),
    };
  } catch {
    return null;
  }
}

/** El valor como texto, o cadena vacía si no hay nada cargado. */
function textoDe(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value);
}

/**
 * El campo, abierto y entero.
 *
 * ⭐ En la tarjeta cada valor entra en una columna de 300px: un avatar de tres
 * párrafos se lee a medias y copiarlo obliga a arrastrar el mouse por un
 * recuadro que hace scroll solo. Acá el texto se muestra completo, en un ancho
 * cómodo de leer, y hay un botón que lo copia de una.
 *
 * El diálogo crece con el contenido y se frena en el alto de la pantalla: dos
 * renglones no abren una ventana vacía, y veinte no se salen por abajo.
 */
function VisorDelCampo({
  field,
  value,
  onClose,
  onEditar,
}: {
  field: FieldDefinition;
  value: string;
  onClose: () => void;
  onEditar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const link = comoLink(value);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles el texto sigue estando seleccionable a mano.
    }
  };

  return (
    <Dialog open onOpenChange={(abierto) => (abierto ? null : onClose())}>
      <DialogContent className="max-h-[85vh] w-auto max-w-[min(42rem,92vw)] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{field.label}</DialogTitle>
        </DialogHeader>

        {/*
          `select-text` explícito y `break-words` para que una URL larga no
          ensanche el diálogo hasta salirse de la pantalla.
        */}
        <div className="max-h-[60vh] overflow-y-auto">
          {link ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            <p className="select-text whitespace-pre-wrap break-words text-sm leading-relaxed">
              {value}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-3">
          <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={copiar}>
            {copiado ? (
              <>
                <ClipboardCheck className="h-3.5 w-3.5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </>
            )}
          </Button>
          {link ? (
            <Button type="button" size="sm" variant="ghost" className="gap-1.5" asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                Abrir
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
          <Button type="button" size="sm" className="gap-1.5" onClick={onEditar}>
            <Pencil className="h-3 w-3" />
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ValorDelCampo({ field, value }: { field: FieldDefinition; value: unknown }) {
  const link = comoLink(value);

  /*
    La plantilla carga todos los campos como texto, pero nada impide configurar
    un apartado con una fecha o una lista de opciones. Ese caso lo dibuja quien
    ya sabe hacerlo, con su color y su formato.
  */
  if (!link && field.fieldType !== "text") {
    return <FieldValueCell field={field} value={value} />;
  }

  /*
    ⭐ El link se dibuja como link pero **no** es un `<a>`: todo el renglón vive
    dentro del botón que abre el visor, y un ancla adentro de un botón es HTML
    inválido. El link de verdad está en el visor, donde además se lee la URL
    entera — «miro.com» no dice a qué tablero apunta.
  */
  if (link) {
    return (
      <span
        className="inline-flex max-w-full items-center gap-1 text-sm text-primary"
        title={link.href}
      >
        <span className="truncate">{link.label}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </span>
    );
  }

  const texto = typeof value === "string" ? value.trim() : "";
  if (!texto) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  /*
    Tres renglones como máximo en la tarjeta: el resto se lee en el visor.
    Entero, un solo campo empuja a los otros seis fuera de la pantalla.
  */
  return (
    <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed">{texto}</p>
  );
}

export function ClientSectionsCard({
  client,
  fields,
}: {
  client: Client;
  /** Las columnas activas del cliente. Se filtran por sección acá adentro. */
  fields: FieldDefinition[];
}) {
  const { refreshClients } = usePlatformData();
  const { push } = useToast();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  /** El campo abierto a pantalla completa, si hay alguno. */
  const [viendo, setViendo] = useState<FieldDefinition | null>(null);

  const porSeccion = FIELD_SECTIONS.map((section) => ({
    section,
    fields: fields.filter((field) => field.section === section),
  })).filter((grupo) => grupo.fields.length > 0);

  const [activa, setActiva] = useState<FieldSection>(
    porSeccion[0]?.section ?? "marketing"
  );

  // Sin ningún campo con sección configurado, la tarjeta no existe.
  if (porSeccion.length === 0) return null;

  const grupo = porSeccion.find((g) => g.section === activa) ?? porSeccion[0]!;

  const empezarAEditar = () => {
    setDraft({ ...(client.custom ?? {}) });
    setEditando(true);
  };

  const guardar = async () => {
    setSaving(true);
    const result = await updateClientCustomFieldsAction({
      clientId: client.id,
      values: draft,
    });
    setSaving(false);

    if (!result.success) {
      push({ title: "No se pudo guardar", description: result.error });
      return;
    }
    await refreshClients();
    setEditando(false);
    push({ title: "Información guardada", variant: "success" });
  };

  return (
    <FichaCard
      icon={Layers}
      title="Información del cliente"
      action={
        editando ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(ACCION_DE_FILA, "h-7 w-7 p-0")}
              title="Cancelar"
              onClick={() => setEditando(false)}
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={guardar}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Guardar
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={empezarAEditar}
          >
            <Pencil className="h-3 w-3" />
            Editar
          </Button>
        )
      }
    >
      <div className="space-y-3">
        {/* Las solapas. Con una sola sección configurada no hacen falta. */}
        {porSeccion.length > 1 ? (
          <div
            className="flex gap-1 rounded-lg bg-muted/50 p-1 dark:bg-white/[0.03]"
            role="tablist"
          >
            {porSeccion.map(({ section, fields: campos }) => {
              const activaEsta = section === activa;
              const cargados = campos.filter((field) => {
                const value = client.custom?.[field.key];
                return typeof value === "string" ? value.trim() !== "" : value != null;
              }).length;

              return (
                <button
                  key={section}
                  type="button"
                  role="tab"
                  aria-selected={activaEsta}
                  onClick={() => setActiva(section)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    activaEsta
                      ? "bg-background text-foreground shadow-sm dark:bg-white/[0.08]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {FIELD_SECTION_LABEL[section]}
                  {/*
                    Cuántos de sus campos están cargados. Es lo que dice de un
                    vistazo qué apartado está vacío sin tener que abrirlo.
                  */}
                  <span className="ml-1 text-[10px] tabular-nums opacity-60">
                    {cargados}/{campos.length}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <dl className="space-y-3">
          {grupo.fields.map((field) => (
            <div key={field.id} className="space-y-1">
              {editando ? (
                <FieldValueInput
                  field={field}
                  value={draft[field.key]}
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, [field.key]: value }))
                  }
                />
              ) : (
                <>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd>
                    {/*
                      ⭐ Con contenido, el valor entero es un botón que lo abre.
                      Vacío no: un «—» que se puede apretar promete algo que no
                      pasa. Un link sigue siendo un link y se abre en su pestaña,
                      así que ahí el botón envuelve sólo el espacio de al lado.
                    */}
                    {textoDe(client.custom?.[field.key]) ? (
                      <button
                        type="button"
                        onClick={() => setViendo(field)}
                        title={`Ver ${field.label} completo`}
                        className="block w-full rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted/60 dark:hover:bg-white/[0.04]"
                      >
                        <ValorDelCampo field={field} value={client.custom?.[field.key]} />
                      </button>
                    ) : (
                      <div className="px-1.5 py-1">
                        <ValorDelCampo field={field} value={client.custom?.[field.key]} />
                      </div>
                    )}
                  </dd>
                </>
              )}
            </div>
          ))}
        </dl>
      </div>

      {viendo ? (
        <VisorDelCampo
          field={viendo}
          value={textoDe(client.custom?.[viendo.key])}
          onClose={() => setViendo(null)}
          onEditar={() => {
            setViendo(null);
            empezarAEditar();
          }}
        />
      ) : null}
    </FichaCard>
  );
}
