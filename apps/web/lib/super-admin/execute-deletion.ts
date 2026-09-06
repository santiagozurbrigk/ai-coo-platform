/**
 * ⭐ La baja de verdad: los pasos que el `delete` de la fila NO hace.
 *
 * Borrar la fila de `organizations` limpia sus ~130 tablas solas, por cascade.
 * Está verificado contra la base real. Pero deja **dos cosas vivas**, y son
 * justo las que hacen que una baja parezca hecha sin estarlo:
 *
 *   1. **La cuenta de login.** `profiles` no tiene ninguna clave foránea a
 *      `auth.users` —cero—, así que el perfil desaparece y la persona sigue
 *      pudiendo entrar. Entra a una cuenta sin organización, ve una pantalla
 *      rota, y del otro lado alguien jura que la dio de baja.
 *   2. **Los archivos.** Ningún cascade llega a Storage. Comprobantes de pago,
 *      adjuntos de SOPs y documentos quedan ahí, con su contenido intacto.
 *
 * El orden importa y es deliberado:
 *
 *   1. Se leen los ids y las rutas **antes** de tocar nada. Después de borrar
 *      la fila ya no hay forma de saber qué archivos eran suyos.
 *   2. Se borra la fila. Si esto falla, no se perdió nada.
 *   3. Se limpian archivos y logins. Si algo de esto falla, la baja quedó a
 *      medias — y eso **se devuelve y se registra**, no se traga. Una baja
 *      parcial reportada como éxito es peor que una que falla entera.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKETS_POR_ORGANIZACION } from "./deletion-plan";

// El cliente admin del proyecto no está tipado contra un schema generado.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>;

export type ResultadoDeBaja = {
  filaBorrada: boolean;
  archivosBorrados: number;
  loginsBorrados: number;
  /** Lo que no se pudo completar. Vacío es el único éxito total. */
  problemas: string[];
};

/** Las rutas de los archivos que viven bajo `<orgId>/` en un bucket. */
async function listarArchivosDeOrganizacion(
  admin: Admin,
  bucket: string,
  organizationId: string
): Promise<string[]> {
  const rutas: string[] = [];

  // `list` no es recursivo: devuelve archivos y "carpetas" de un solo nivel. Se
  // recorre a mano porque las rutas reales tienen hasta tres niveles
  // (`<org>/drafts/<winId>/archivo.png`).
  async function recorrer(prefijo: string, profundidad: number): Promise<void> {
    // Tope de profundidad, por si alguna ruta creciera sola.
    if (profundidad > 5) return;

    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefijo, { limit: 1000 });

    if (error || !data) return;

    for (const entrada of data) {
      const ruta = `${prefijo}/${entrada.name}`;
      // Storage marca los archivos con id; las carpetas vienen sin él.
      if (entrada.id) {
        rutas.push(ruta);
      } else {
        await recorrer(ruta, profundidad + 1);
      }
    }
  }

  await recorrer(organizationId, 0);
  return rutas;
}

export async function contarArchivosDeOrganizacion(
  admin: Admin,
  organizationId: string
): Promise<number> {
  let total = 0;
  for (const bucket of BUCKETS_POR_ORGANIZACION) {
    total += (await listarArchivosDeOrganizacion(admin, bucket, organizationId)).length;
  }
  return total;
}

/**
 * Da de baja la organización entera.
 *
 * `profileIds` se pasa desde afuera porque hay que leerlo **antes** de borrar
 * la fila: una vez que el cascade se lleva `profiles`, ya no hay de dónde sacar
 * qué cuentas de login había que dar de baja.
 */
export async function ejecutarBajaDeOrganizacion(
  admin: Admin,
  organizationId: string,
  profileIds: readonly string[]
): Promise<ResultadoDeBaja> {
  const problemas: string[] = [];

  // 1 · Las rutas, antes de que desaparezca de dónde deducirlas.
  const porBucket: { bucket: string; rutas: string[] }[] = [];
  for (const bucket of BUCKETS_POR_ORGANIZACION) {
    const rutas = await listarArchivosDeOrganizacion(admin, bucket, organizationId);
    if (rutas.length > 0) porBucket.push({ bucket, rutas });
  }

  // 2 · La fila. Si falla acá, no se tocó nada todavía.
  const { error: errorFila } = await admin
    .from("organizations")
    .delete()
    .eq("id", organizationId);

  if (errorFila) {
    return {
      filaBorrada: false,
      archivosBorrados: 0,
      loginsBorrados: 0,
      problemas: [`No se pudo dar de baja la organización: ${errorFila.message}`],
    };
  }

  // 3 · Archivos, en tandas para no depender de dónde está el límite de `remove`.
  let archivosBorrados = 0;
  for (const { bucket, rutas } of porBucket) {
    for (let i = 0; i < rutas.length; i += 100) {
      const tanda = rutas.slice(i, i + 100);
      const { error } = await admin.storage.from(bucket).remove(tanda);
      if (error) {
        problemas.push(
          `Quedaron ${tanda.length} archivos en "${bucket}": ${error.message}`
        );
      } else {
        archivosBorrados += tanda.length;
      }
    }
  }

  // 4 · Las cuentas de login, una por una: la API no las da de baja en lote, y
  // si una falla las demás tienen que resolverse igual.
  let loginsBorrados = 0;
  for (const id of profileIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      problemas.push(`La cuenta de login ${id} sigue activa: ${error.message}`);
    } else {
      loginsBorrados += 1;
    }
  }

  return { filaBorrada: true, archivosBorrados, loginsBorrados, problemas };
}

/**
 * Da de baja a una persona: su perfil y su cuenta de login.
 *
 * Sus archivos **no** se tocan: pertenecen a la organización, no a quien los
 * subió. Sacar el comprobante de un pago porque se fue quien lo cargó sería
 * borrar información del negocio.
 */
export async function ejecutarBajaDeUsuario(
  admin: Admin,
  profileId: string
): Promise<ResultadoDeBaja> {
  const problemas: string[] = [];

  const { error: errorPerfil } = await admin
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (errorPerfil) {
    return {
      filaBorrada: false,
      archivosBorrados: 0,
      loginsBorrados: 0,
      problemas: [`No se pudo borrar el perfil: ${errorPerfil.message}`],
    };
  }

  const { error: errorLogin } = await admin.auth.admin.deleteUser(profileId);
  if (errorLogin) {
    problemas.push(`La cuenta de login sigue activa: ${errorLogin.message}`);
  }

  return {
    filaBorrada: true,
    archivosBorrados: 0,
    loginsBorrados: errorLogin ? 0 : 1,
    problemas,
  };
}
