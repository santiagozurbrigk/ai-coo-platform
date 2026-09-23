/**
 * Las preguntas del formulario de onboarding, para cargarlas con un botón.
 *
 * ⭐ Es la plantilla, no la fuente de verdad. Una vez cargadas, cada pregunta es
 * una columna configurable de la organización: se renombra, se reescribe o se
 * archiva desde Campos personalizados, y el formulario lee de ahí. Este archivo
 * sólo decide con qué arranca una organización que aprieta el botón.
 *
 * Salen tal cual del formulario que Limitless usaba antes (repo
 * `client-onboarding`, `src/lib/formConfig.ts`), extraídas con un script para
 * no reescribirlas a mano. Tres cambios:
 *
 *   · Cada una tiene un nombre corto (`label`), que es lo que se ve en la
 *     ficha, y la pregunta completa (`question`), que es lo que lee el cliente.
 *     Un renglón de 160 caracteres en mayúsculas no se lee como título.
 *   · «Tu nombre» y «Nombre del Creador» no son preguntas: el creador ya es el
 *     cliente del growth partner dueño del link, y el nombre de quien completa
 *     queda en el envío.
 *   · El repetidor de personas del paso 9 es un texto con plantilla
 *     (`onb_team_members`). Una tabla es un tipo de campo que todavía no existe.
 *
 * ⭐ Las claves llevan el prefijo `onb_` porque el formulario viejo usaba
 * `avatar`, que choca con el «Avatar» de la Plantilla Limitless.
 *
 * ⭐ Todas son obligatorias salvo que digan lo contrario, como en el original
 * («si no tenés, poné "no tengo"»): una respuesta vacía no distingue entre "no
 * existe" y "no lo quise contestar".
 */

export type OnboardingQuestionSeed = {
  key: string;
  label: string;
  step: string;
  question?: string;
  help?: string;
  audio?: string;
  options?: { value: string; label: string }[];
  showIf?: { key: string; equals: string };
  /** Por defecto obligatoria. */
  required?: boolean;
};

export const ONBOARDING_QUESTIONS: readonly OnboardingQuestionSeed[] = [
  {
    key: "onb_phone",
    label: "WhatsApp",
    step: "negocio",
    question: "Teléfono (WhatsApp)",
  },
  {
    key: "onb_industry",
    label: "Nicho",
    step: "negocio",
    question: "¿En qué nicho trabajás?",
  },
  {
    key: "onb_access_crm",
    label: "CRM / tracker de ventas",
    step: "accesos",
    question: "Enviame link o acceso a tu CRM/Tracker de Ventas",
    help: "Ideal: los últimos 6 meses con fecha, lead, canal, si asistió, si calificaba, si cerró, cuánto pagó y cómo.",
  },
  {
    key: "onb_access_youtube",
    label: "YouTube",
    step: "accesos",
    question: "Link de tu YouTube (si tenés canal)",
    help: "Si no tenés, poné \"no tengo\".",
  },
  {
    key: "onb_access_instagram",
    label: "Instagram",
    step: "accesos",
    question: "Link de tu perfil de Instagram (si tenés)",
    help: "Si no tenés, poné \"no tengo\".",
  },
  {
    key: "onb_access_tiktok",
    label: "TikTok",
    step: "accesos",
    question: "Link de tu perfil de TikTok (si tenés)",
    help: "Si no tenés, poné \"no tengo\".",
  },
  {
    key: "onb_access_landing",
    label: "Landing / web",
    step: "accesos",
    question: "Link de tu Landing/Web",
    help: "Si no tenés, poné \"no tengo\".",
  },
  {
    key: "onb_revenue_3m",
    label: "Facturación y cash de los últimos 3 meses",
    step: "numeros",
    question: "Facturación y cash cobrado de los últimos 3 meses, mes a mes",
    help: "Si tenés una planilla de KPIs, pegá el link y listo. Si no, armá la tablita: mes / facturado / cobrado.",
  },
  {
    key: "onb_ticket_list_price",
    label: "Precio de lista de la oferta principal",
    step: "numeros",
    question: "Precio de lista de tu oferta principal",
  },
  {
    key: "onb_ticket_cash_collected",
    label: "Precio real promedio (cash collected)",
    step: "numeros",
    question: "Precio real promedio (Cash Collected)",
    help: "Se calcula como el Cash Collected del último mes dividido la cantidad de clientes que ingresaron ese mes.",
  },
  {
    key: "onb_ticket_payment_split",
    label: "% que paga completo vs en cuotas",
    step: "numeros",
    question: "¿Qué % de tus clientes paga completo vs en cuotas?",
  },
  {
    key: "onb_upsell_repurchase_count",
    label: "Clientes con upsell o recompra",
    step: "numeros",
    question: "¿Cuántos de tus clientes hacen upsell o recompra?",
  },
  {
    key: "onb_adspend_by_channel",
    label: "Inversión en ads y ROAS (3 meses)",
    step: "numeros",
    question: "Inversión en ads por mes y ROAS (últimos 3 meses)",
  },
  {
    key: "onb_revenue_by_channel",
    label: "Plata por canal",
    step: "numeros",
    question: "¿Tenés trackeado cuánto dinero vino de cada medio?",
    help: "Si está trackeado, contanos cuánto de cada uno (ej: $10.000 de upsells, $20.000 de Instagram, $30.000 de YouTube, $60.000 de VSL funnel).",
  },
  {
    key: "onb_goal_and_launches",
    label: "Objetivo de facturación y próximos lanzamientos",
    step: "numeros",
    question: "Tu objetivo de facturación a 6-12 meses y qué lanzamientos, eventos o cambios de precio tenés previstos en los próximos 120 días",
    audio: "2 min",
  },
  {
    key: "onb_organic_metrics_summary",
    label: "Métricas de orgánico",
    step: "numeros",
    question: "Resumen de métricas orgánico",
    help: "Reels:\n• Respuestas (DMs que generó el reel)\n• Tasa de respuesta sobre views — sano 1 a 3%\n• Seguidores nuevos\n• Agendas calificadas que trajo\n• Cash collected directo\n• Dolor / ángulo / CTA / formato que usó\n\nHistorias:\n• Respuestas de la secuencia\n• Cash collected directo\n• Plata por chat (cash collected ÷ respuestas)\n• Dolor / ángulo / CTA y destino\n\nYouTube:\n• CTR de la miniatura\n• Retención promedio\n• Consultas o agendas que trajo\n• Cash collected directo\n• Dolor / ángulo / CTA y destino",
  },
  {
    key: "onb_ads_metrics_summary",
    label: "Métricas de ads",
    step: "numeros",
    question: "Resumen de métricas ads",
    help: "• CTR — 1 a 2% frío / 2 a 4% warm\n• CPC\n• CPM\n• Frecuencia\n• Costo por resultado (registro, lead, agenda o compra)\n• Gasto acumulado\n• Gasto por anuncio ordenado de mayor a menor\n• Inversión diaria\n• ROAS del front\n• ROAS del embudo completo\n• CAC\n• AOV",
  },
  {
    key: "onb_webinar_metrics_summary",
    label: "Métricas de webinar",
    step: "numeros",
    question: "Resumen de métricas webinar",
    help: "• Visitas a la página de registro\n• Conversión de la página\n• Registrados\n• Costo por registro\n• Show rate — 30% con audiencia propia / 12 a 15% en frío / 50%+ con grupo de WhatsApp\n• Asistentes que llegan al pitch\n• Agendamiento sobre asistentes\n• Show a la llamada\n• Cierre sobre TODAS las agendas\n• Ventas y facturación\n• Cash collected\n\nPlata:\n• Costo por agenda\n• CAC\n• ROI del lanzamiento — 5:1 sano, 1,2:1 con equipo flojo\n• Ventas dentro de la ventana de carrito\n\nSi vendés directo en el webinar (sin llamadas):\n• Se cae la etapa de agendas\n• Compra sobre asistentes",
  },
  {
    key: "onb_avatar",
    label: "Cliente ideal",
    step: "oferta",
    question: "Tu cliente ideal: quién es, cuánto gana/factura, en qué momento de su vida o negocio está cuando te compra, y de qué país suele ser",
    help: "Si tenés un documento desarrollado, podés enviarnos eso.",
    audio: "5 min",
  },
  {
    key: "onb_customer_problems",
    label: "Problemas principales y cómo los resuelve",
    step: "oferta",
    question: "Contame los 3 a 5 problemas con los que más te llega la gente. Por cada uno, cómo lo resolvés vos.",
  },
  {
    key: "onb_comparison_objections",
    label: "Con quién lo comparan y objeciones",
    step: "oferta",
    question: "¿Con quién te comparan cuando te están por comprar, y qué objeciones escuchás?",
  },
  {
    key: "onb_offer_full",
    label: "Oferta completa y garantía",
    step: "oferta",
    question: "Tu oferta completa: qué prometés exactamente, qué entregás, cuánto dura, qué bonos tiene. ¿Ofrecés garantía?",
    audio: "5 min",
  },
  {
    key: "onb_mechanism",
    label: "Método / mecanismo",
    step: "oferta",
    question: "Tu método/mecanismo: cómo se llama, qué lo hace distinto de tu competencia, ¿lo estás mostrando públicamente?",
    audio: "3 min",
  },
  {
    key: "onb_method_three_steps",
    label: "Método en tres pasos",
    step: "oferta",
    question: "Resumime tu método en tres pasos, y decime qué hace el resto de tu mercado que vos no hacés",
  },
  {
    key: "onb_proprietary_system",
    label: "Software o sistema propio",
    step: "oferta",
    question: "¿Tenés algún software, planilla o sistema propio que hayas creado?",
  },
  {
    key: "onb_other_offers",
    label: "Otras ofertas",
    step: "oferta",
    question: "¿Qué otras ofertas tenés o tuviste? (low ticket, upsell, servicio DFY)",
  },
  {
    key: "onb_story",
    label: "Historia del creador",
    step: "historia",
    question: "Contame la historia del creador",
    help: "De dónde viene, cómo llegó a esto, sus resultados propios, sus credenciales, por qué hace lo que hace.",
    audio: "10 min",
  },
  {
    key: "onb_public_persona",
    label: "Percepción pública y posicionamiento",
    step: "historia",
    question: "¿Cómo querés ser percibido públicamente? ¿Qué mostrás y qué no? ¿Contra qué o quién te posicionás (tu \"enemigo\" en el mercado)?",
    audio: "3 min",
  },
  {
    key: "onb_content_limits",
    label: "Límites de contenido y horas para grabar",
    step: "historia",
    question: "¿Qué NO estás dispuesto a hacer en contenido? ¿Cuántas horas por semana REALES tenés para grabar?",
    help: "Ej: grabarte todos los días, mostrar familia, hablar de plata, tendencias.",
    audio: "2 min",
  },
  {
    key: "onb_social_proof_raw",
    label: "Carpeta de prueba social",
    step: "historia",
    question: "Prueba social en crudo: link a la carpeta con TODOS tus testimonios y casos de éxito",
    help: "Videos, screenshots, audios, resultados con números (antes → después → en cuánto tiempo). Sin editar, todo a la carpeta de Drive.",
  },
  {
    key: "onb_competitors",
    label: "Competidores directos",
    step: "mercado",
    question: "Tus 3 competidores directos (venden lo mismo que vos, al mismo cliente). Por cada uno: link a su Instagram + todo lo que sepas",
    help: "Qué venden, a qué precio, cómo es su funnel, qué hacen bien, qué hacen mal, qué te molesta que hagan.",
    audio: "por competidor",
  },
  {
    key: "onb_us_references",
    label: "Referentes de Estados Unidos",
    step: "mercado",
    question: "3 referentes de Estados Unidos que vendan algo muy parecido a lo tuyo, al mismo tipo de cliente",
    help: "Link + lo que sepas de su oferta y su funnel. Si no conocés ninguno, decinos a quiénes consumís VOS del mercado yankee y nosotros encontramos el resto.",
  },
  {
    key: "onb_funnel_walkthrough",
    label: "Recorrido completo del funnel",
    step: "funnel",
    question: "El camino completo de un desconocido hasta que te paga: ¿dónde te ve, qué toca, qué mira, qué recibe, con quién habla, cómo paga? Incluí TODOS los funnels activos",
    audio: "5 min",
  },
  {
    key: "onb_funnel_links",
    label: "Links del funnel",
    step: "funnel",
    question: "Links a: landing page, VSL, lead magnets, webinars, checkout, calendario de agendamiento",
  },
  {
    key: "onb_lead_nurture",
    label: "Nutrición del lead antes de la llamada",
    step: "funnel",
    question: "¿Qué recibe un lead entre que deja sus datos y la llamada? (mails, WhatsApps, videos, ¿o nada?)",
  },
  {
    key: "onb_runs_ads",
    label: "¿Corre anuncios?",
    step: "funnel",
    question: "¿Corrés anuncios?",
    options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }],
  },
  {
    key: "onb_ad_campaigns",
    label: "Campañas de ads",
    step: "funnel",
    question: "¿Qué campañas corrés?",
    help: "Ej: Adquisición, Nutrición, Reminder, Follow Me, a DM.",
    showIf: { key: "onb_runs_ads", equals: "si" },
  },
  {
    key: "onb_ad_campaign_strategy",
    label: "Estrategia de ads",
    step: "funnel",
    question: "¿Cuál es la estrategia detrás de esas campañas?",
    help: "Ej: hago 2 videos por cada dolor y una imagen, o testeo 10 copys y al que me funciona le hago 10 variantes.",
    showIf: { key: "onb_runs_ads", equals: "si" },
  },
  {
    key: "onb_old_vsls",
    label: "VSLs anteriores",
    step: "funnel",
    question: "TODOS tus VSLs anteriores con fecha aproximada de cuándo corrieron",
    help: "Los viejos también: especialmente los viejos.",
  },
  {
    key: "onb_historic_winners",
    label: "Ganadores históricos",
    step: "funnel",
    question: "Tus ganadores históricos: ¿cuál fue el ad o contenido que MÁS plata te trajo en tu historia? ¿Sigue activo? Si lo apagaste, ¿por qué?",
    help: "Pasanos el video/copy a la carpeta de Drive.",
  },
  {
    key: "onb_tracking_pixel",
    label: "Píxel y API de conversiones",
    step: "funnel",
    question: "¿Tenés píxel y API de conversiones configurados?",
  },
  {
    key: "onb_tracking_attribution",
    label: "Atribución por canal",
    step: "funnel",
    question: "¿Cómo sabés de qué canal vino cada venta?",
  },
  {
    key: "onb_ad_account_history",
    label: "Historial de la cuenta publicitaria",
    step: "funnel",
    question: "¿Tu cuenta publicitaria tuvo bloqueos, rechazos o bajas? ¿Tenés cuentas backup?",
  },
  {
    key: "onb_runs_email_campaigns",
    label: "¿Corre campañas de email?",
    step: "funnel",
    question: "¿Corrés campañas de email?",
    options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }],
  },
  {
    key: "onb_email_campaigns",
    label: "Campañas de email",
    step: "funnel",
    question: "¿Qué campañas corrés?",
    help: "Ej: Adquisición, Nutrición, Reminder, Newsletter.",
    showIf: { key: "onb_runs_email_campaigns", equals: "si" },
  },
  {
    key: "onb_email_campaign_strategy",
    label: "Estrategia de email",
    step: "funnel",
    question: "¿Cuál es la estrategia detrás de esas campañas?",
    help: "Ej: hago 2 emails al día, uno de caso de éxito y otro de data, los 2 con CTA.",
    showIf: { key: "onb_runs_email_campaigns", equals: "si" },
  },
  {
    key: "onb_content_machine",
    label: "Máquina de contenido",
    step: "organico",
    question: "¿Cómo funciona hoy tu máquina de contenido? Quién tiene las ideas, quién guiona, quién graba, quién edita, quién publica, y dónde se traba todo",
  },
  {
    key: "onb_formats_and_cadence",
    label: "Formatos y frecuencia",
    step: "organico",
    question: "¿Qué medios usás (reels, carruseles, historias, YouTube) y cuántas piezas reales publicás por semana de cada uno? ¿Ya tenés formatos ganadores?",
  },
  {
    key: "onb_stories_strategy",
    label: "Estrategia y calendario de contenido",
    step: "organico",
    question: "¿Tenés estrategia de historias? ¿Y de reels? ¿Y de YouTube? ¿Cómo es tu calendario de contenido?",
  },
  {
    key: "onb_top_content_by_revenue",
    label: "Top 10 contenidos por plata",
    step: "organico",
    question: "Tu top 10 de contenidos históricos por PLATA (los que trajeron clientes, no los que tuvieron más views). Links",
  },
  {
    key: "onb_content_measurement",
    label: "Cómo mide el contenido",
    step: "organico",
    question: "¿Cómo medís hoy qué contenido funciona?",
    help: "Si la respuesta es \"no mido\", perfecto: decilo, lo armamos nosotros.",
  },
  {
    key: "onb_qualified_calls_sample",
    label: "Últimas calls calificadas",
    step: "ventas",
    question: "Pasame tus últimas 5 calls calificadas que pagaron (idealmente PIF) y tus últimas 5 calls calificadas que no pagaron",
    help: "Subilas a la carpeta de Drive y confirmá acá.",
  },
  {
    key: "onb_qualified_chats_sample",
    label: "Últimos chats calificados",
    step: "ventas",
    question: "Pasame tus últimos 5 chats calificados que pagaron y tus últimos 5 chats calificados que no pagaron",
    help: "Capturas o export del chat completo (DM, WhatsApp, etc.). Subilos a la carpeta de Drive y confirmá acá.",
  },
  {
    key: "onb_sales_scripts",
    label: "Scripts de ventas",
    step: "ventas",
    question: "Pasame tus scripts actuales de closing, setting y cualquier otro que usen (triaje, follow-up, DMs, etc.)",
    help: "Link al doc o subilos a la carpeta de Drive y confirmá acá. Si alguno no lo tenés escrito, poné \"no lo tengo\".",
  },
  {
    key: "onb_sales_team_metrics",
    label: "Equipo de ventas y métricas",
    step: "ventas",
    question: "¿Qué equipo de ventas tenés y cuáles son sus métricas personales?",
    help: "Ej:\nCloser Juan — 50% show up, 30% close rate, toma 5 llamadas al día, mete $20.000 por mes al negocio.\nSetter Pedro — 70% de tasa de respuesta, 10% tasa de agenda, maneja 100 chats al día.\nTriaje Sebas — 70% de show up, maneja 50 agendas por semana, se cierran 40%.",
  },
  {
    key: "onb_top_clients",
    label: "Top 10 clientes",
    step: "ventas",
    question: "Tus 10 clientes que MÁS pagaron: por cada uno, ¿cómo estaba antes de comprarte? ¿Qué resultados tuvo? ¿Cuánto y cómo pagó? ¿Qué tipo de avatar era y qué dolores tenía?",
  },
  {
    key: "onb_client_onboardings",
    label: "Onboardings de sus clientes",
    step: "ventas",
    question: "Si les hacés formulario de onboarding a tus clientes, pasanos los últimos 5-10 completos",
    help: "Subilos al Drive y confirmá acá.",
  },
  {
    key: "onb_objections",
    label: "Objeciones y respuestas",
    step: "ventas",
    question: "¿Cuáles son las 5 objeciones que más escuchás en las llamadas y cómo las contestan hoy tus vendedores?",
  },
  {
    key: "onb_lead_belief_shift",
    label: "Creencia que cambia en la llamada",
    step: "ventas",
    question: "¿Qué aprenden los leads en la llamada que cambia esa creencia?",
  },
  {
    key: "onb_old_leads",
    label: "Leads viejos sin trabajar",
    step: "ventas",
    question: "¿Cuántos leads viejos tenés acumulados sin trabajar y dónde están? (CRM, mails, DMs; número aproximado)",
  },
  {
    key: "onb_sales_process_walkthrough",
    label: "Proceso de ventas",
    step: "ventas",
    question: "¿Cuál es el proceso de ventas exacto que pasa un lead? ¿Con quién habla? ¿Qué le envían?",
  },
  {
    key: "onb_sales_process_example_doc",
    label: "Ejemplo real del proceso",
    step: "ventas",
    question: "Pasame imágenes de un ejemplo real en un doc y envialo",
  },
  {
    key: "onb_sales_process_breakdown",
    label: "Dónde se rompe el proceso",
    step: "ventas",
    question: "¿Dónde se suele romper este proceso?",
  },
  {
    key: "onb_sales_presentation",
    label: "Presentación de ventas",
    step: "ventas",
    question: "En la llamada de venta, ¿usan presentación de ventas? Compartinos la también.",
  },
  {
    key: "onb_team_tools",
    label: "Herramientas de organización",
    step: "equipo",
    question: "¿Qué herramientas usan para organizarse? (Notion, Slack, Trello, grupo de WhatsApp)",
  },
  {
    key: "onb_operational_contact",
    label: "Contacto operativo",
    step: "equipo",
    question: "¿Quién va a ser nuestro contacto operativo del día a día?",
  },
  {
    key: "onb_team_members",
    label: "Integrantes del equipo",
    step: "equipo",
    question: "¿Quiénes forman tu equipo de marketing y ventas?",
    help: "Una persona por renglón: rol, nombre, cómo se le paga, cuánto rinde del 1 al 10 y por qué.\nEj: Closer — Juan — comisión 10% — 8/10, cierra bien pero no hace seguimiento.",
    required: false,
  },
  {
    key: "onb_marketing_history",
    label: "Historial de marketing",
    step: "historial",
    question: "Todo lo que YA probaste en marketing y qué pasó: agencias anteriores (por qué se fueron), funnels que apagaste, ángulos que quemaste, cambios de comunicación y cuándo",
    audio: "5-10 min",
  },
  {
    key: "onb_best_month",
    label: "Mejor mes de la historia",
    step: "historial",
    question: "¿Cuál fue tu MEJOR mes de la historia? ¿Qué estabas comunicando en ese momento (qué promesa, qué garantía, qué ads)? ¿Qué cambió desde entonces?",
    audio: "3 min",
  },
  {
    key: "onb_delivery_roadmap",
    label: "Roadmap del cliente nuevo",
    step: "entrega_servicio",
    help: "El paso a paso desde que paga hasta que termina, con el día 1 en detalle. Cada paso con su entregable, su responsable y su semana. Cuál es el primer resultado y a los cuántos días llega. Si el roadmap cambia según el punto de partida. Quién detecta al que no avanza.",
  },
  {
    key: "onb_delivery_entry_problems",
    label: "Problemas de entrada",
    step: "entrega_servicio",
    help: "Los problemas más frecuentes ordenados por frecuencia, y en qué paso del roadmap se resuelve cada uno. El problema que el cliente dice que tiene vs. el que realmente tiene. El problema que llega seguido y el programa no resuelve. Qué probó antes y por qué falló.",
  },
  {
    key: "onb_delivery_friction_perception",
    label: "Trabas y percepción",
    step: "entrega_servicio",
    help: "Dónde se traban, si está medido y con qué dato, y si la traba cambia por avatar. Cómo destraban hoy y si está sistematizado. Qué porcentaje sale adelante. Del otro lado: qué destacan los clientes en sus propias palabras, si eso coincide con lo que se vende en la call, y qué parte del programa nadie menciona nunca.",
  },
  {
    key: "onb_delivery_last_5_cases",
    label: "Últimos 5 casos",
    step: "entrega_servicio",
    question: "Últimos 5 casos, con nombre",
    help: "Por cada uno: avatar y punto de partida, situación previa y qué había probado, qué parte del mecanismo movió la aguja, resultado con moneda y plazo, tiempo al primer resultado y al final, y qué hizo distinto respecto a los que no llegan.",
  },
  {
    key: "onb_delivery_top_3_cases",
    label: "Los 3 casos más grandes",
    step: "entrega_servicio",
    help: "La misma pasada, más dos preguntas: si el resultado es replicable o dependió de algo que ese cliente ya tenía, y si da testimonio en video con sus números.",
  },
  {
    key: "onb_delivery_written_material",
    label: "Material a pedir por escrito",
    step: "entrega_servicio",
    question: "Material a pedir por escrito al cerrar, con fecha",
    help: "Roadmap documentado, material de onboarding del día 1.",
  },
];
