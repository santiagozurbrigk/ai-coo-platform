import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resuelve —o crea— el lead al que pertenece un turno.
 *
 * ⭐ **La identidad es el mail, con el contacto de GHL como respaldo.** Nunca el
 * nombre: los nombres de la base vienen con emojis y espacios dobles
 * (`"🩷 Diana Villarreal"`), y fusionar dos personas por tener un nombre parecido
 * es peor que dejarlas separadas. Un turno sin mail ni contacto **no genera
 * lead**: queda suelto hasta que un sync le complete la identidad.
 *
 * Se llama desde los syncs de Calendly y GHL, con el cliente que ya tienen.
 */

export type LeadIdentity = {
  name: string;
  email?: string | null;
  phone?: string | null;
  ghlContactId?: string | null;
};

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function resolveLeadId(
  supabase: SupabaseClient,
  organizationId: string,
  identity: LeadIdentity
): Promise<string | null> {
  const email = clean(identity.email)?.toLowerCase() ?? null;
  const ghlContactId = clean(identity.ghlContactId);

  // Sin identidad estable no se crea nada: un lead por nombre uniría gente
  // distinta y ensuciaría los hilos de forma irreversible.
  if (!email && !ghlContactId) return null;

  // Buscar primero. El mail manda: es la identidad que sobrevive al proveedor.
  if (email) {
    const { data } = await supabase
      .from("sales_leads")
      .select("id")
      .eq("organization_id", organizationId)
      .ilike("email", email)
      .maybeSingle();
    if (data?.id) {
      // Completar el contacto de GHL si el lead se había creado sin él.
      if (ghlContactId) {
        await supabase
          .from("sales_leads")
          .update({ ghl_contact_id: ghlContactId, updated_at: new Date().toISOString() })
          .eq("id", data.id)
          .is("ghl_contact_id", null);
      }
      return data.id as string;
    }
  }

  if (ghlContactId) {
    const { data } = await supabase
      .from("sales_leads")
      .select("id, email")
      .eq("organization_id", organizationId)
      .eq("ghl_contact_id", ghlContactId)
      .maybeSingle();
    if (data?.id) {
      // El lead existía por contacto de GHL y recién ahora conocemos su mail.
      if (email && !data.email) {
        await supabase
          .from("sales_leads")
          .update({ email, updated_at: new Date().toISOString() })
          .eq("id", data.id);
      }
      return data.id as string;
    }
  }

  const { data: created, error } = await supabase
    .from("sales_leads")
    .insert({
      organization_id: organizationId,
      name: clean(identity.name) ?? "Sin nombre",
      email,
      phone: clean(identity.phone),
      ghl_contact_id: ghlContactId,
    })
    .select("id")
    .single();

  if (error) {
    // Carrera entre dos syncs sobre el mismo lead: el índice único la corta y
    // acá se recupera el que ganó, en vez de perder el vínculo del turno.
    if (email) {
      const { data } = await supabase
        .from("sales_leads")
        .select("id")
        .eq("organization_id", organizationId)
        .ilike("email", email)
        .maybeSingle();
      if (data?.id) return data.id as string;
    }
    console.error("[resolveLeadId] No se pudo crear el lead:", error.message);
    return null;
  }

  return created.id as string;
}
