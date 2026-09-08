"use client";

import { FathomMemberAccountsSection } from "../fathom-member-accounts";
import { UnlinkedRecordingsPanel } from "../unlinked-recordings-panel";
import type { UnlinkedRecording } from "@/app/fathom/sales-call-actions";

/**
 * Configuración de Fathom: quién tiene su cuenta conectada, y qué grabaciones no
 * cruzaron con ningún turno.
 *
 * Las dos cosas estaban en la pantalla pero en lugares distintos: las cuentas por
 * miembro colgaban debajo de la tarjeta de Fathom y la cola de vinculación era una
 * sección aparte al final de la página, con su propio encabezado. Son la misma
 * conversación —"¿esta integración está trayendo las llamadas de venta?"— y ahora
 * viven juntas.
 */
export function FathomSettings({
  currentUserId,
  unlinkedRecordings,
}: {
  currentUserId: string | null;
  unlinkedRecordings: UnlinkedRecording[];
}) {
  return (
    <div className="space-y-5">
      {currentUserId ? (
        <FathomMemberAccountsSection currentUserId={currentUserId} />
      ) : null}
      <UnlinkedRecordingsPanel recordings={unlinkedRecordings} />
    </div>
  );
}
