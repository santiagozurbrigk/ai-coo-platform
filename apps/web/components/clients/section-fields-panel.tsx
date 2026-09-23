"use client";

/**
 * Los tres apartados de información: Marketing, Ventas y Sistemas.
 *
 * ⭐ Desde el add-on `growth_partners` no se cargan en el cliente sino en cada
 * uno de **sus** clientes (ver `client-sub-clients-card.tsx`): el panel recibe
 * los valores y cómo guardarlos, y no sabe de quién son.
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
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { ACCION_DE_FILA } from "@/components/clients/ficha-section";
import { FieldValueCell } from "@/components/clients/custom-fields/field-value-cell";
import { FieldValueInput } from "@/components/clients/custom-fields/field-value-input";
import { useToast } from "@/providers/toast-provider";
import { groupFieldsByStep } from "@/lib/client-onboarding/form";
import {
  FIELD_SECTION_LABEL,
  FIELD_SECTIONS,
  type FieldDefinition,
  type FieldSection,
} from "@/types/custom-fields";
import type { CustomFieldValues } from "@/types/custom-fields";

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

/**
 * Las solapas de Marketing, Ventas y Sistemas, con su botón de editar.
 *
 * `onSave` devuelve el error como texto, o `null` si guardó: el panel no sabe
 * si está guardando un cliente o un cliente de un cliente.
 */
export function SectionFieldsPanel({
  fields,
  values,
  onSave,
}: {
  /** Las columnas activas. Se filtran por sección acá adentro. */
  fields: FieldDefinition[];
  values: CustomFieldValues;
  onSave: (values: CustomFieldValues) => Promise<string | null>;
}) {
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

  if (porSeccion.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-muted-foreground">
        Todavía no hay campos de Marketing, Ventas y Sistemas. Cargalos con
        «Plantilla Limitless» (y las preguntas del onboarding) en Campos
        personalizados.
      </p>
    );
  }

  const grupo = porSeccion.find((g) => g.section === activa) ?? porSeccion[0]!;

  const empezarAEditar = () => {
    setDraft({ ...values });
    setEditando(true);
  };

  const guardar = async () => {
    setSaving(true);
    const error = await onSave(draft);
    setSaving(false);

    if (error) {
      push({ title: "No se pudo guardar", description: error });
      return;
    }
    setEditando(false);
    push({ title: "Información guardada", variant: "success" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Las solapas. Con una sola sección configurada no hacen falta. */}
        {porSeccion.length > 1 ? (
          <div
            className="flex min-w-0 flex-1 gap-1 rounded-lg bg-muted/50 p-1 dark:bg-white/[0.03]"
            role="tablist"
          >
            {porSeccion.map(({ section, fields: campos }) => {
              const activaEsta = section === activa;
              const cargados = campos.filter((field) => {
                const value = values[field.key];
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
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex shrink-0 items-center gap-1">
          {editando ? (
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
              className={cn(ACCION_DE_FILA, "h-7 w-7 p-0")}
              title="Editar"
              onClick={empezarAEditar}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/*
        ⭐ La solapa «Onboarding» trae decenas de respuestas: van agrupadas por
        el paso del formulario donde se preguntaron. Las otras solapas no tienen
        pasos y quedan como siempre, en un solo bloque.
      */}
      {groupFieldsByStep(grupo.fields).map((bloque) => (
        <div key={bloque.title ?? "todo"} className="space-y-3">
          {bloque.title ? (
            <p className="border-b border-border/50 pb-1 pt-2 text-xs font-semibold text-foreground dark:border-white/[0.06]">
              {bloque.title}
            </p>
          ) : null}
          <dl className="space-y-3">
            {bloque.fields.map((field) => (
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
                        pasa.
                      */}
                      {textoDe(values[field.key]) ? (
                        <button
                          type="button"
                          onClick={() => setViendo(field)}
                          title={`Ver ${field.label} completo`}
                          className="block w-full rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted/60 dark:hover:bg-white/[0.04]"
                        >
                          <ValorDelCampo field={field} value={values[field.key]} />
                        </button>
                      ) : (
                        <div className="px-1.5 py-1">
                          <ValorDelCampo field={field} value={values[field.key]} />
                        </div>
                      )}
                    </dd>
                  </>
                )}
              </div>
            ))}
          </dl>
        </div>
      ))}

      {viendo ? (
        <VisorDelCampo
          field={viendo}
          value={textoDe(values[viendo.key])}
          onClose={() => setViendo(null)}
          onEditar={() => {
            setViendo(null);
            empezarAEditar();
          }}
        />
      ) : null}
    </div>
  );
}
