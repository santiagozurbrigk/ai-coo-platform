"use client";

/**
 * ⭐ Un canal de Discord y de quién es.
 *
 * Responde las dos preguntas que el usuario pidió poder contestar, y las
 * mantiene separadas porque en un servidor real no coinciden:
 *
 * 1. **¿De quién es este canal?** De un cliente (uno o varios) o comunitario.
 * 2. **¿Quién es quién acá adentro?** La gente que escribió, para asociarla a
 *    su ficha.
 *
 * La segunda es la que resuelve el caso medido en producción: 335 clientes,
 * **una** persona vinculada, 15 de 16 mensajes sin dueño. Esos nombres ya están
 * guardados; lo que faltaba era un lugar donde decir quién es cada uno.
 */

import { useState, useTransition } from "react";
import { Badge, Button, cn } from "@ai-coo/ui";
import { ChevronDown, Hash, Trophy, UserPlus, Users, X } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import {
  addDiscordChannelClientAction,
  linkDiscordPersonAction,
  removeDiscordChannelClientAction,
  setDiscordChannelPurposeAction,
  setDiscordChannelWinsAction,
  unlinkDiscordPersonAction,
  type DiscordChannelPerson,
} from "@/app/discord/actions";
import type { ChannelPurpose, MonitoredChannel } from "@/types/discord";

type Cliente = { id: string; name: string };

export function DiscordChannelCard({
  channel,
  clientIds,
  people,
  clients,
  onRemove,
  onChanged,
}: {
  channel: MonitoredChannel;
  clientIds: string[];
  people: DiscordChannelPerson[];
  clients: Cliente[];
  onRemove: () => void;
  onChanged: () => void;
}) {
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const [paraSumar, setParaSumar] = useState("");

  const esDeCliente = channel.purpose === "client";
  const sinAsignar = people.filter((persona) => !persona.clientId).length;

  const correr = (
    accion: () => Promise<{ success: boolean; error?: string }>,
    exito: string,
  ) => {
    startTransition(async () => {
      const res = await accion();
      if (!res.success) {
        push({ title: "No se pudo guardar", description: res.error });
        return;
      }
      push({ title: exito, variant: "success" });
      onChanged();
    });
  };

  const nombreDe = (id: string) =>
    clients.find((cliente) => cliente.id === id)?.name ?? "Cliente";

  return (
    <div className="rounded-lg border border-border/60">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">{channel.channel_name}</span>
          {channel.wins ? (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Trophy className="h-2.5 w-2.5" />
              Logros
            </Badge>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={pending}
          className="text-muted-foreground hover:text-destructive disabled:opacity-50"
          aria-label="Dejar de monitorear"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3 border-t border-border/40 px-3 py-3">
        {/* ── Tipo de canal ── */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["client", "De un cliente"],
              ["community", "Comunitario"],
            ] as [ChannelPurpose, string][]
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              disabled={pending}
              onClick={() =>
                correr(
                  () => setDiscordChannelPurposeAction(channel.channel_id, valor),
                  valor === "client"
                    ? "Canal de cliente"
                    : "Canal comunitario",
                )
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-60",
                channel.purpose === valor
                  ? "border-primary bg-primary/10 font-medium text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {etiqueta}
            </button>
          ))}

          <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={channel.wins}
              disabled={pending}
              onChange={(e) => {
                // Se lee acá y no dentro del callback: el callback corre
                // después, en una transición, y para entonces el checkbox pudo
                // haber cambiado — se guardaría un valor distinto del que la
                // persona apretó.
                const tildado = e.target.checked;
                correr(
                  () =>
                    setDiscordChannelWinsAction(channel.channel_id, tildado),
                  tildado
                    ? "El bot va a buscar logros acá"
                    : "El bot deja de buscar logros acá",
                );
              }}
              className="h-3.5 w-3.5 rounded border-border/60"
            />
            Acá se comparten logros
          </label>
        </div>

        {/* ── Dueños del canal ── */}
        {esDeCliente ? (
          <div className="space-y-2">
            {clientIds.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin cliente asignado. Hasta que le asignes uno, el canal se lee
                pero sus mensajes no se le cuentan a nadie.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {clientIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs"
                  >
                    {nombreDe(id)}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        correr(
                          () =>
                            removeDiscordChannelClientAction(
                              channel.channel_id,
                              id,
                            ),
                          "Cliente quitado del canal",
                        )
                      }
                      className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                      aria-label={`Quitar ${nombreDe(id)}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <select
                value={paraSumar}
                onChange={(e) => setParaSumar(e.target.value)}
                disabled={pending}
                className="h-8 flex-1 rounded-lg border border-border/60 bg-muted/20 px-2 text-xs"
              >
                <option value="">Sumar un cliente…</option>
                {clients
                  .filter((cliente) => !clientIds.includes(cliente.id))
                  .map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.name}
                    </option>
                  ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                disabled={!paraSumar || pending}
                onClick={() => {
                  const id = paraSumar;
                  setParaSumar("");
                  correr(
                    () =>
                      addDiscordChannelClientAction(channel.channel_id, id),
                    "Cliente asignado al canal",
                  );
                }}
              >
                Sumar
              </Button>
            </div>

            {/*
              ⭐ El aviso que evita una atribución silenciosamente equivocada.
              Con dos dueños no hay forma de saber cuál de ellos escribió, así
              que los mensajes de gente sin vincular quedan sin dueño. Decirlo
              acá es la diferencia entre una limitación y un bug invisible.
            */}
            {clientIds.length > 1 ? (
              <p className="text-xs text-muted-foreground">
                Con más de un cliente, los mensajes sólo se cuentan cuando quien
                escribe está asociado abajo: no hay forma de saber cuál de ellos
                escribió.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Escriben muchos clientes. Los mensajes se cuentan sólo para la gente
            que esté asociada acá abajo.
          </p>
        )}

        {/* ── Quién es quién ── */}
        <div className="border-t border-border/40 pt-2">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="flex w-full items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                abierto ? "" : "-rotate-90",
              )}
            />
            <Users className="h-3.5 w-3.5" />
            Quiénes escribieron acá ({people.length})
            {sinAsignar > 0 ? (
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {sinAsignar} sin asociar
              </Badge>
            ) : null}
          </button>

          {abierto ? (
            <div className="mt-2 space-y-1.5">
              {people.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nadie escribió todavía en este canal.
                </p>
              ) : (
                people.map((persona) => (
                  <PersonRow
                    key={persona.discordUserId}
                    persona={persona}
                    clients={clients}
                    disabled={pending}
                    nombreDe={nombreDe}
                    correr={correr}
                  />
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PersonRow({
  persona,
  clients,
  disabled,
  nombreDe,
  correr,
}: {
  persona: DiscordChannelPerson;
  clients: Cliente[];
  disabled: boolean;
  nombreDe: (id: string) => string;
  correr: (
    accion: () => Promise<{ success: boolean; error?: string }>,
    exito: string,
  ) => void;
}) {
  const [elegido, setElegido] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/40">
      <span className="min-w-0 flex-1 truncate text-xs">
        {persona.name}
        <span className="ml-1.5 text-muted-foreground">
          · {persona.messages}
          {persona.messages === 1 ? " mensaje" : " mensajes"}
        </span>
      </span>

      {persona.clientId ? (
        <>
          <Badge variant="success" className="text-[10px]">
            {nombreDe(persona.clientId)}
          </Badge>
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              correr(
                () => unlinkDiscordPersonAction(persona.discordUserId),
                "Vinculación deshecha",
              )
            }
            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
            aria-label="Desvincular"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          <select
            value={elegido}
            onChange={(e) => setElegido(e.target.value)}
            disabled={disabled}
            className="h-7 w-44 rounded-lg border border-border/60 bg-muted/20 px-2 text-[11px]"
          >
            <option value="">Es el cliente…</option>
            {clients.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-[11px]"
            disabled={!elegido || disabled}
            onClick={() =>
              correr(
                () =>
                  linkDiscordPersonAction(persona.discordUserId, elegido),
                "Persona asociada a su cliente",
              )
            }
          >
            <UserPlus className="h-3 w-3" />
            Asociar
          </Button>
        </>
      )}
    </div>
  );
}
