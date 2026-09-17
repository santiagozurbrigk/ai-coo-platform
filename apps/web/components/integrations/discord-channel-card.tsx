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
import {
  Briefcase,
  Check,
  ChevronDown,
  Hash,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import {
  addDiscordChannelClientAction,
  linkDiscordPersonAction,
  markDiscordPersonAsTeamAction,
  removeDiscordChannelClientAction,
  setDiscordChannelPurposeAction,
  setDiscordChannelWinsAction,
  unlinkDiscordPersonAction,
  type DiscordChannelPerson,
  type DiscordTeamOption,
} from "@/app/discord/actions";
import type { ChannelPurpose, MonitoredChannel } from "@/types/discord";

type Cliente = { id: string; name: string };

export function DiscordChannelCard({
  channel,
  clientIds,
  people,
  clients,
  team,
  onRemove,
  onChanged,
}: {
  channel: MonitoredChannel;
  clientIds: string[];
  people: DiscordChannelPerson[];
  clients: Cliente[];
  team: DiscordTeamOption[];
  onRemove: () => void;
  onChanged: () => void;
}) {
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const [paraSumar, setParaSumar] = useState("");

  const esDeCliente = channel.purpose === "client";
  /**
   * ⭐ El equipo no cuenta como pendiente.
   *
   * Antes este número incluía a todo el que no fuera cliente, así que la gente
   * del propio equipo figuraba como "falta asociar" para siempre — un cartel
   * que nunca se apaga deja de leerse, y con él se dejan de ver los que sí
   * faltan. En el servidor real eran 4 de 7.
   */
  const sinAsignar = people.filter(
    (persona) => !persona.clientId && !persona.isTeam,
  ).length;

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
                    team={team}
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

/**
 * Una persona del canal: quién es, o quién podría ser.
 *
 * Tres estados posibles —cliente, equipo, sin definir— y en el tercero, la
 * sugerencia. La sugerencia **muestra su nivel de certeza** en vez de
 * esconderlo: confirmar un "puede ser" apurado es exactamente lo que mete a un
 * cliente en el equipo y hace que sus mensajes dejen de contarse en silencio.
 */
function PersonRow({
  persona,
  clients,
  team,
  disabled,
  nombreDe,
  correr,
}: {
  persona: DiscordChannelPerson;
  clients: Cliente[];
  team: DiscordTeamOption[];
  disabled: boolean;
  nombreDe: (id: string) => string;
  correr: (
    accion: () => Promise<{ success: boolean; error?: string }>,
    exito: string,
  ) => void;
}) {
  const [elegido, setElegido] = useState("");

  const soltar = () =>
    correr(
      () => unlinkDiscordPersonAction(persona.discordUserId),
      "Persona sin definir",
    );

  if (persona.clientId) {
    return (
      <FilaBase persona={persona}>
        <Badge variant="success" className="text-[10px]">
          {nombreDe(persona.clientId)}
        </Badge>
        <BotonSoltar onClick={soltar} disabled={disabled} />
      </FilaBase>
    );
  }

  if (persona.isTeam) {
    const nombre = team.find((p) => p.id === persona.profileId)?.name;
    return (
      <FilaBase persona={persona}>
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <Briefcase className="h-2.5 w-2.5" />
          {/* Sin perfil elegido igual es equipo: el dato no falta, es así. */}
          {nombre ?? "Equipo"}
        </Badge>
        <BotonSoltar onClick={soltar} disabled={disabled} />
      </FilaBase>
    );
  }

  const sugerencia = persona.suggestion;

  return (
    <div className="space-y-1.5 rounded-lg px-2 py-1.5 hover:bg-muted/40">
      <div className="flex flex-wrap items-center gap-2">
        <NombreDe persona={persona} />

        <select
          value={elegido}
          onChange={(e) => setElegido(e.target.value)}
          disabled={disabled}
          className="h-7 w-52 rounded-lg border border-border/60 bg-muted/20 px-2 text-[11px]"
        >
          <option value="">Quién es…</option>
          <optgroup label="Es un cliente">
            {clients.map((cliente) => (
              <option key={cliente.id} value={`client:${cliente.id}`}>
                {cliente.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Es de tu equipo">
            {team.map((persona) => (
              <option key={persona.id} value={`team:${persona.id}`}>
                {persona.name}
              </option>
            ))}
            {/*
              El caso que se olvida: alguien que labura con vos y no tiene
              cuenta en Limitless. Sin esta opción se queda sin marcar y sus
              mensajes siguen contándose como de un cliente.
            */}
            <option value="team:">Del equipo, sin cuenta en Limitless</option>
          </optgroup>
        </select>

        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px]"
          disabled={!elegido || disabled}
          onClick={() => {
            const [tipo, id] = partirValor(elegido);
            setElegido("");
            correr(
              () =>
                tipo === "client"
                  ? linkDiscordPersonAction(persona.discordUserId, id)
                  : markDiscordPersonAsTeamAction(
                      persona.discordUserId,
                      id || null,
                    ),
              tipo === "client"
                ? "Persona asociada a su cliente"
                : "Marcada como parte del equipo",
            );
          }}
        >
          Guardar
        </Button>
      </div>

      {sugerencia ? (
        <ChipDeSugerencia
          persona={persona}
          sugerencia={sugerencia}
          disabled={disabled}
          correr={correr}
        />
      ) : null}
    </div>
  );
}

/** El valor del desplegable es `tipo:id`; el id puede venir vacío a propósito. */
function partirValor(valor: string): ["client" | "team", string] {
  const corte = valor.indexOf(":");
  const tipo = valor.slice(0, corte) === "client" ? "client" : "team";
  return [tipo, valor.slice(corte + 1)];
}

const TEXTO_DEL_NIVEL: Record<string, string> = {
  exacto: "El nombre coincide exacto",
  fuerte: "El nombre coincide",
  posible: "Puede ser",
};

function ChipDeSugerencia({
  persona,
  sugerencia,
  disabled,
  correr,
}: {
  persona: DiscordChannelPerson;
  sugerencia: NonNullable<DiscordChannelPerson["suggestion"]>;
  disabled: boolean;
  correr: (
    accion: () => Promise<{ success: boolean; error?: string }>,
    exito: string,
  ) => void;
}) {
  const esEquipo = sugerencia.tipo === "team";

  return (
    <div className="flex flex-wrap items-center gap-2 pl-1 text-[11px] text-muted-foreground">
      <span>
        {TEXTO_DEL_NIVEL[sugerencia.nivel]} con{" "}
        <span className="text-foreground">{sugerencia.nombre}</span>
        {esEquipo ? " de tu equipo" : ", un cliente"}
        {/*
          El nivel más flojo se dice con todas las letras. Los otros dos se
          confirman de un vistazo; éste hay que mirarlo dos veces.
        */}
        {sugerencia.nivel === "posible" ? " — revisalo antes de confirmar" : ""}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-6 gap-1 px-2 text-[11px]"
        disabled={disabled}
        onClick={() =>
          correr(
            () =>
              esEquipo
                ? markDiscordPersonAsTeamAction(
                    persona.discordUserId,
                    sugerencia.id,
                  )
                : linkDiscordPersonAction(persona.discordUserId, sugerencia.id),
            esEquipo
              ? "Marcada como parte del equipo"
              : "Persona asociada a su cliente",
          )
        }
      >
        <Check className="h-3 w-3" />
        Confirmar
      </Button>
    </div>
  );
}

function NombreDe({ persona }: { persona: DiscordChannelPerson }) {
  return (
    <span className="min-w-0 flex-1 truncate text-xs">
      {persona.name}
      <span className="ml-1.5 text-muted-foreground">
        · {persona.messages}
        {persona.messages === 1 ? " mensaje" : " mensajes"}
      </span>
    </span>
  );
}

function FilaBase({
  persona,
  children,
}: {
  persona: DiscordChannelPerson;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/40">
      <NombreDe persona={persona} />
      {children}
    </div>
  );
}

function BotonSoltar({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="text-muted-foreground hover:text-destructive disabled:opacity-50"
      aria-label="Dejar sin definir"
    >
      <X className="h-3 w-3" />
    </button>
  );
}
