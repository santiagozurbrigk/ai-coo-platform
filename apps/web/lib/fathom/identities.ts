/**
 * B · L2 — La capa de IO de las identidades: leer, sembrar y aprender.
 *
 * La decisión de **qué** sembrar vive en `seed-identities.ts`, que es puro y está
 * testeado. Acá sólo se habla con la base.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildIdentitySeeds,
  type IdentitySeed,
  type SeedablePerson,
} from "@/lib/fathom/seed-identities";
import { identityToLearn } from "@/lib/fathom/resolve-counterparty";
import type { ClientIdentity } from "@/types/fathom-identities";

type IdentityRow = {
  id: string;
  organization_id: string;
  client_id: string | null;
  lead_id: string | null;
  identity_type: string;
  value: string;
  normalized_value: string;
  source: string;
  times_matched: number;
  last_matched_at: string | null;
};

function rowToIdentity(row: IdentityRow): ClientIdentity {
  return {
    id: row.id,
    organizationId: row.organization_id,
    clientId: row.client_id,
    leadId: row.lead_id,
    identityType: row.identity_type as ClientIdentity["identityType"],
    value: row.value,
    normalizedValue: row.normalized_value,
    source: row.source as ClientIdentity["source"],
    timesMatched: row.times_matched,
    lastMatchedAt: row.last_matched_at,
  };
}

/**
 * Todas las identidades de una organización.
 *
 * Se traen enteras y se resuelve en memoria: son pocas —una o dos por persona—
 * y el resolvedor las recorre varias veces por llamada. Una consulta por
 * peldaño sería cuatro consultas por grabación.
 */
export async function loadOrganizationIdentities(
  organizationId: string
): Promise<ClientIdentity[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("client_identities")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    console.error("[fathom:identities] load", error.message);
    return [];
  }
  return (data as IdentityRow[]).map(rowToIdentity);
}

export type SeedResult = {
  /** Cuántas identidades quedaron guardadas. */
  created: number;
  /** Valores que apuntaban a dos personas distintas y quedaron sin sembrar. */
  ambiguous: { identityType: string; value: string; owners: number }[];
};

/**
 * Siembra las identidades de una organización desde su CRM.
 *
 * ⭐ Es **idempotente**: se puede correr las veces que haga falta. Usa
 * `upsert ... ignoreDuplicates` contra el índice único, así una identidad que ya
 * existe —sembrada antes, o **aprendida al confirmar una llamada**— no se pisa.
 * Pisarla sería degradar un `manual_confirmation` a `seed` y perder la señal de
 * que alguien lo confirmó a mano.
 */
export async function seedOrganizationIdentities(
  organizationId: string
): Promise<SeedResult> {
  const admin = createAdminClient();

  const [clientsResult, leadsResult] = await Promise.all([
    admin
      .from("clients")
      .select("id, name, nickname, email")
      .eq("organization_id", organizationId),
    admin
      .from("sales_leads")
      .select("id, name, email")
      .eq("organization_id", organizationId),
  ]);

  const people: SeedablePerson[] = [
    ...((clientsResult.data ?? []) as {
      id: string;
      name: string | null;
      nickname: string | null;
      email: string | null;
    }[]).map((row) => ({
      clientId: row.id,
      leadId: null,
      name: row.name,
      nickname: row.nickname,
      email: row.email,
    })),
    ...((leadsResult.data ?? []) as {
      id: string;
      name: string | null;
      email: string | null;
    }[]).map((row) => ({
      clientId: null,
      leadId: row.id,
      name: row.name,
      email: row.email,
    })),
  ];

  const { seeds, ambiguous } = buildIdentitySeeds(people);
  if (seeds.length === 0) return { created: 0, ambiguous };

  const { error } = await admin
    .from("client_identities")
    .upsert(seeds.map((seed) => toRow(seed, organizationId)), {
      onConflict: "organization_id,identity_type,normalized_value",
      ignoreDuplicates: true,
    });

  if (error) throw new Error(error.message);

  // Cuántas hay ahora, que es lo que el usuario quiere saber. `upsert` con
  // `ignoreDuplicates` no informa cuántas filas insertó de verdad.
  const { count } = await admin
    .from("client_identities")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  return { created: count ?? 0, ambiguous };
}

function toRow(seed: IdentitySeed, organizationId: string) {
  return {
    organization_id: organizationId,
    client_id: seed.clientId,
    lead_id: seed.leadId,
    identity_type: seed.identityType,
    value: seed.value,
    normalized_value: seed.normalizedValue,
    source: seed.source,
  };
}

/**
 * ⭐ Aprender el alias de una persona cuando alguien confirma una llamada a mano.
 *
 * Es lo que hace que el trabajo manual tienda a cero: la próxima grabación con
 * ese mismo nombre de pantalla se resuelve sola, por el peldaño 2, sin volver a
 * preguntar. Sin esto, el módulo pide confirmación para siempre.
 *
 * No falla la confirmación si el alias no se puede guardar: el vínculo de la
 * llamada ya es correcto, y perder el aprendizaje es molesto, no grave.
 */
export async function learnSpeakerAliasFromConfirmation(params: {
  organizationId: string;
  speakerName: string | null;
  clientId: string | null;
  leadId: string | null;
}): Promise<boolean> {
  const existing = await loadOrganizationIdentities(params.organizationId);
  const learned = identityToLearn(
    params.speakerName,
    { clientId: params.clientId, leadId: params.leadId },
    existing
  );
  if (!learned) return false;

  const admin = createAdminClient();
  const { error } = await admin.from("client_identities").upsert(
    {
      organization_id: params.organizationId,
      client_id: params.clientId,
      lead_id: params.leadId,
      identity_type: learned.identityType,
      value: learned.value,
      normalized_value: learned.normalizedValue,
      source: "manual_confirmation",
    },
    {
      onConflict: "organization_id,identity_type,normalized_value",
      ignoreDuplicates: true,
    }
  );

  if (error) {
    console.error("[fathom:identities] learn alias", error.message);
    return false;
  }
  return true;
}
