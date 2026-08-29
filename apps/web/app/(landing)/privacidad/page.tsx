import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    `Conocé cómo ${brand.name} recopila, usa y protege tu información personal.`,
};

const LAST_UPDATED = "14 de julio de 2026";
const CONTACT_EMAIL = "hola@optimizatucontrol.com";
const APP_URL = "https://app.optimizatucontrol.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white/90">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-white/40">
          Última actualización: {LAST_UPDATED}
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-white/70">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            1. Quiénes somos
          </h2>
          <p>
            {brand.legalName} es una plataforma de gestión operativa con
            inteligencia artificial para negocios de infoproductos. Operamos en{" "}
            <span className="text-white/90">{APP_URL}</span> y en{" "}
            <span className="text-white/90">www.optimizatucontrol.com</span>.
          </p>
          <p className="mt-2">
            Ante cualquier consulta sobre privacidad podés escribirnos a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-violet-400 hover:text-violet-300"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            2. Qué información recopilamos
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="text-white/90">Datos de cuenta:</span> nombre,
              dirección de correo electrónico y contraseña (almacenada en forma
              de hash) al registrarte.
            </li>
            <li>
              <span className="text-white/90">Datos de tu negocio:</span>{" "}
              información que vos mismo cargás en la plataforma (clientes,
              ventas, contenido, documentos operativos, etc.).
            </li>
            <li>
              <span className="text-white/90">Integraciones de terceros:</span>{" "}
              cuando conectás servicios externos, accedemos únicamente a los
              datos necesarios para la funcionalidad (ver sección 4).
            </li>
            <li>
              <span className="text-white/90">Datos de uso:</span> registros de
              acceso, funcionalidades utilizadas y métricas de rendimiento de la
              aplicación para mejorar el servicio.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            3. Cómo usamos tu información
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Proveer y mejorar las funcionalidades de la plataforma.</li>
            <li>
              Procesar los datos de tu negocio con inteligencia artificial para
              generar análisis, reportes y recomendaciones dentro de {brand.name}.
            </li>
            <li>
              Enviarte notificaciones relacionadas con tu cuenta o el servicio
              (sin fines publicitarios de terceros).
            </li>
            <li>
              Diagnosticar errores técnicos y garantizar la seguridad de la
              plataforma.
            </li>
          </ul>
          <p className="mt-3">
            No vendemos ni compartimos tu información personal con terceros con
            fines publicitarios.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            4. Integraciones con Google
          </h2>
          <p className="mb-3">
            {brand.name} permite conectar tu cuenta de Google para sincronizar datos de
            las siguientes APIs. El acceso es de{" "}
            <span className="text-white/90">solo lectura</span> salvo que se
            indique lo contrario:
          </p>
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
            <div>
              <p className="font-medium text-white/90">Google Drive</p>
              <p className="mt-1">
                Scope:{" "}
                <code className="rounded bg-white/10 px-1 text-xs text-violet-300">
                  drive.readonly
                </code>
              </p>
              <p className="mt-1">
                Usamos este permiso para que puedas vincular archivos de tu
                Drive (videos, documentos) a tus piezas de contenido en {brand.name}.
                La IA puede analizar el archivo vinculado para brindarte
                insights sobre ese contenido. {brand.name} no modifica, mueve ni elimina
                ningún archivo de tu Drive.
              </p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="font-medium text-white/90">Google Forms</p>
              <p className="mt-1">
                Scopes:{" "}
                <code className="rounded bg-white/10 px-1 text-xs text-violet-300">
                  forms.body.readonly
                </code>{" "}
                <code className="rounded bg-white/10 px-1 text-xs text-violet-300">
                  forms.responses.readonly
                </code>
              </p>
              <p className="mt-1">
                Sincronizamos la estructura y las respuestas de tus formularios
                de Google para que puedas visualizarlos dentro de {brand.name} y usarlos
                como fuente de datos para el análisis de leads. {brand.name} no crea ni
                modifica formularios.
              </p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="font-medium text-white/90">YouTube</p>
              <p className="mt-1 flex flex-wrap gap-1">
                {[
                  "youtube.readonly",
                  "yt-analytics.readonly",
                  "yt-analytics-monetary.readonly",
                  "youtube.upload",
                ].map((s) => (
                  <code
                    key={s}
                    className="rounded bg-white/10 px-1 text-xs text-violet-300"
                  >
                    {s}
                  </code>
                ))}
              </p>
              <p className="mt-2">
                <span className="text-white/90">youtube.readonly:</span>{" "}
                sincronizamos tu canal, videos y estadísticas básicas con el
                módulo de contenido de {brand.name}.
              </p>
              <p className="mt-1">
                <span className="text-white/90">yt-analytics.readonly y yt-analytics-monetary.readonly:</span>{" "}
                accedemos a métricas avanzadas de tus videos (retención de
                audiencia, fuentes de tráfico, demografía e ingresos del canal)
                para enriquecer el análisis de contenido dentro de {brand.name}.
              </p>
              <p className="mt-1">
                <span className="text-white/90">youtube.upload:</span>{" "}
                permite subir videos a tu canal directamente desde {brand.name} cuando
                uses la función de publicación de contenido.
              </p>
              <p className="mt-1">
                {brand.name} no elimina videos, no modifica títulos ni descripciones sin
                tu acción explícita, y no accede a configuraciones de monetización
                más allá de las métricas de lectura autorizadas.
              </p>
            </div>
          </div>
          <p className="mt-4">
            El uso que {brand.name} hace de la información recibida de las APIs de Google
            cumple con la{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300"
            >
              Política de datos de usuario de los servicios de API de Google
            </a>
            , incluidos los requisitos de uso limitado.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            5. Almacenamiento y seguridad
          </h2>
          <p>
            Tus datos se almacenan en servidores de{" "}
            <span className="text-white/90">Supabase</span> (PostgreSQL
            gestionado, región São Paulo, Brasil) y se sirven a través de{" "}
            <span className="text-white/90">Vercel</span>. Aplicamos cifrado en
            tránsito (HTTPS/TLS) y en reposo. Los tokens de acceso a servicios
            de terceros se almacenan cifrados con AES-256-GCM.
          </p>
          <p className="mt-2">
            Implementamos control de acceso por filas (Row Level Security) en
            la base de datos para que cada organización solo acceda a sus
            propios datos.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            6. Retención de datos
          </h2>
          <p>
            Conservamos tu información mientras tu cuenta esté activa. Si
            cancelás tu cuenta, eliminamos tus datos personales y los de tu
            organización en un plazo de 30 días, salvo obligación legal de
            retención.
          </p>
          <p className="mt-2">
            Podés solicitar la eliminación de tus datos en cualquier momento
            escribiendo a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-violet-400 hover:text-violet-300"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            7. Proveedores de servicios (sub-procesadores)
          </h2>
          <p className="mb-3">
            Trabajamos con los siguientes proveedores que pueden procesar datos
            en nombre de {brand.name}:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="text-white/90">Supabase</span> — base de datos y
              autenticación
            </li>
            <li>
              <span className="text-white/90">Vercel</span> — hosting y
              serverless functions
            </li>
            <li>
              <span className="text-white/90">Anthropic</span> — procesamiento
              de IA (los datos enviados no se usan para entrenar modelos)
            </li>
            <li>
              <span className="text-white/90">OpenAI</span> — generación de
              embeddings para búsqueda semántica
            </li>
            <li>
              <span className="text-white/90">Resend</span> — envío de correos
              transaccionales
            </li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            8. Tus derechos
          </h2>
          <p>Tenés derecho a:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Acceder a los datos que tenemos sobre vos.</li>
            <li>Corregir información inexacta.</li>
            <li>Solicitar la eliminación de tus datos.</li>
            <li>
              Revocar el acceso de {brand.name} a tus cuentas de Google, YouTube o Drive
              en cualquier momento desde la configuración de tu cuenta de Google
              (
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300"
              >
                myaccount.google.com/permissions
              </a>
              ).
            </li>
            <li>Exportar tus datos en formato estructurado.</li>
          </ul>
          <p className="mt-3">
            Para ejercer cualquiera de estos derechos, escribinos a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-violet-400 hover:text-violet-300"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            9. Cookies y rastreo
          </h2>
          <p>
            {brand.name} utiliza cookies de sesión estrictamente necesarias para mantener
            tu inicio de sesión. No utilizamos cookies de rastreo de terceros ni
            publicidad comportamental.
          </p>
          <p className="mt-2">
            Podemos utilizar métricas de uso anonimizadas (sin datos
            personales identificables) para mejorar la plataforma.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            10. Cambios a esta política
          </h2>
          <p>
            Si realizamos cambios materiales a esta política, te notificaremos
            por correo electrónico o mediante un aviso visible en la plataforma
            con al menos 7 días de anticipación. La fecha de última
            actualización siempre estará visible al inicio de este documento.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 text-base font-medium text-white">
            11. Contacto
          </h2>
          <p>
            Si tenés preguntas sobre esta política de privacidad o sobre el
            tratamiento de tus datos, escribinos a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-violet-400 hover:text-violet-300"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
