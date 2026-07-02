/**
 * Repara lead_name de una conversación de Instagram con ID de Unipile.
 * Uso:
 *   npx tsx scripts/repair-unipile-instagram-lead-name.ts [conversationId]
 *   npx tsx scripts/repair-unipile-instagram-lead-name.ts df68a09b-... --name "Santiago Zurbrigk"
 */
import { repairUnipileConversationLeadName } from "../lib/unipile/repair-lead-name";

const DEFAULT_CONVERSATION_ID = "df68a09b-9448-4623-b654-778673883c30";

function parseArgs(argv: string[]) {
  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const nameFlagIndex = argv.findIndex((arg) => arg === "--name");
  const knownName =
    nameFlagIndex >= 0 ? argv[nameFlagIndex + 1]?.trim() : undefined;

  return {
    conversationId: positional[0]?.trim() || DEFAULT_CONVERSATION_ID,
    knownName,
  };
}

async function main() {
  const { conversationId, knownName } = parseArgs(process.argv.slice(2));

  if (
    !knownName &&
    (!process.env.UNIPILE_DSN?.trim() || !process.env.UNIPILE_ACCESS_TOKEN?.trim())
  ) {
    console.error(
      "Faltan UNIPILE_DSN o UNIPILE_ACCESS_TOKEN (o pasá --name para reparación directa)"
    );
    process.exit(1);
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const result = await repairUnipileConversationLeadName(conversationId, {
    knownName,
  });
  if (!result.updated) {
    console.log(`Sin cambios para conversación ${conversationId}`);
    return;
  }

  console.log(`lead_name actualizado a: ${result.leadName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
