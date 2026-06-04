import type { ProductData, SpatialProductNode } from "@/types/product";
import { paths } from "@/routes/paths";

export const mockProductData: ProductData = {
  avatars: [
    {
      id: "main",
      name: "Marcos",
      age: 34,
      role: "Coach de negocios",
      location: "Buenos Aires, Argentina",
      isMain: true,
      currentRevenue: "$20k-$40k/mes",
      targetRevenue: "$100k/mes",
      yearsInBusiness: "2-4 años",
      innerVoice:
        '"Sé que mi producto funciona pero no puedo escalar sin depender de mí para todo"',
      pains: [
        "Su equipo depende de él para cada decisión",
        "No tiene sistemas documentados",
        "Las ventas son inconsistentes mes a mes",
        "No tiene tiempo para trabajar EN el negocio",
        "El onboarding de clientes es un caos",
      ],
      dreams: [
        "Equipo autónomo que no lo necesite constantemente",
        "Facturar $100k/mes con procesos sistemáticos",
        "Tener visibilidad real de todo su negocio",
        "Viajar sin que el negocio se detenga",
        "Escalar sin contratar más personas",
      ],
      objections: [
        { text: "No tengo tiempo para implementar esto ahora", frequency: 47 },
        { text: "Ya probé otras cosas y no funcionaron", frequency: 31 },
        { text: "Necesito consultarlo con mi equipo", frequency: 22 },
      ],
      buyTrigger:
        "Ver a otro coach en su mismo nivel escalar mucho más rápido",
      aiInsights: [
        'Nueva objeción detectada en los últimos 30 días: "Mi negocio es muy particular para sistemas genéricos" (aparece en 8 conversaciones)',
        'Los leads que mencionan "equipo" en los primeros 3 mensajes tienen 2.3x más probabilidad de cerrar',
        "Perfil real de los últimos 12 cierres: 83% facturaba entre $15k-$35k, no $30k-$50k como se pensaba",
      ],
    },
    {
      id: "secondary",
      name: "Laura",
      age: 28,
      role: "Creadora de contenido",
      location: "LATAM",
      isMain: false,
      currentRevenue: "$5k-$15k/mes",
      targetRevenue: "$30k/mes",
      yearsInBusiness: "1-2 años",
      innerVoice:
        '"Tengo audiencia pero no sé cómo convertirla en un negocio real"',
      pains: [
        "Revenue dependiente de sponsors y marcas",
        "Sin oferta propia estructurada",
        "No sabe cómo cobrar por su conocimiento",
      ],
      dreams: [
        "Lanzar su primer programa de $1.000+",
        "Revenue predecible sin depender de marcas",
        "Comunidad de clientes que paguen",
      ],
      objections: [
        { text: "Mi audiencia no puede pagar eso", frequency: 58 },
        { text: "Todavía no tengo suficiente autoridad", frequency: 35 },
      ],
      buyTrigger: "Ver a otro creador lanzar su primer curso exitoso",
      aiInsights: [
        "Sub-avatar detectado automáticamente: 34% de los leads del programa grupal tienen este perfil",
      ],
    },
  ],

  valueLadder: [
    {
      id: "free",
      name: "Lead Magnet",
      price: 0,
      priceModel: "Gratis",
      description: "Guía de sistemas para coaches",
      isCore: false,
      closesPerMonth: "—",
      closeRate: 0,
    },
    {
      id: "low",
      name: "Mini Curso",
      price: 97,
      priceModel: "Pago único",
      description: "Fundamentos de operaciones",
      isCore: false,
      closesPerMonth: 8,
      closeRate: 12,
    },
    {
      id: "mid",
      name: "Programa Grupal",
      price: 1500,
      priceModel: "3 cuotas de $500",
      description: "12 semanas de implementación",
      isCore: false,
      closesPerMonth: 6,
      closeRate: 68,
    },
    {
      id: "core",
      name: "Mentoría Individual",
      price: 3000,
      priceModel: "Upfront o 2 cuotas",
      description: "6 meses 1-a-1",
      isCore: true,
      closesPerMonth: 4,
      closeRate: 54,
    },
    {
      id: "premium",
      name: "Mastermind VIP",
      price: 15000,
      priceModel: "Anual",
      description: "Grupo élite reducido",
      isCore: false,
      closesPerMonth: 1,
      closeRate: 38,
    },
  ],

  offers: [
    {
      id: "mid",
      name: "Programa Grupal",
      price: 1500,
      promise:
        "Implementar los primeros sistemas operacionales de tu negocio en 12 semanas con acompañamiento grupal",
      targetAvatar: "Laura, 28 — Creadora de contenido",
      promisedResult: "Primeros sistemas implementados y equipo más autónomo",
      timeframe: "12 semanas",
      guarantee:
        "30 días de garantía — si en 30 días no ves resultados, devolvemos el dinero",
      mainObjection: "Mi negocio es muy particular para un programa grupal",
      objectionHandler:
        "El programa tiene sesiones 1-a-1 mensuales para adaptar cada sistema al negocio específico",
      includes: [
        {
          title: "12 semanas de programa",
          description: "2 sesiones grupales por semana",
        },
        {
          title: "Sesión 1-a-1 mensual",
          description: "Adaptación al negocio específico",
        },
        { title: "Comunidad privada", description: "Acceso al grupo de Discord" },
        {
          title: "Templates y SOPs base",
          description: "Biblioteca de sistemas listos para usar",
        },
        {
          title: "Grabaciones de todas las sesiones",
          description: "Acceso de por vida",
        },
      ],
      stats: {
        monthlyRevenue: "$9.000",
        closeRate: 68,
        topObjection: "Tiempo disponible",
        completionRate: 78,
      },
      aiInsight:
        "Los clientes que completan el programa tienen 3.2x más probabilidad de hacer upsell a Mentoría Individual en los siguientes 90 días.",
    },
    {
      id: "core",
      name: "Mentoría Individual",
      price: 3000,
      promise:
        "Sistematizar completamente tu negocio y escalar a $100k/mes sin depender de ti para todo",
      targetAvatar: "Marcos, 34 — Coach de negocios",
      promisedResult:
        "Negocio sistematizado con equipo autónomo facturando $100k/mes",
      timeframe: "6 meses",
      guarantee: "60 días de garantía incondicional",
      mainObjection: "Ya probé mentorías antes y no funcionaron",
      objectionHandler:
        "Esta mentoría es 100% práctica — cada sesión termina con un deliverable concreto implementado en el negocio",
      includes: [
        { title: "2 sesiones semanales 1-a-1", description: "60 min cada una" },
        { title: "Acceso directo por WhatsApp", description: "Respuesta en menos de 4 horas" },
        { title: "Auditoría completa del negocio", description: "Primera semana" },
        { title: "Implementación de SOPs", description: "Todos los procesos documentados" },
        {
          title: "Sistema de reportes del equipo",
          description: "Visibilidad operacional total",
        },
        { title: "Acceso a software OTC", description: "6 meses incluidos" },
      ],
      stats: {
        monthlyRevenue: "$12.000",
        closeRate: 54,
        topObjection: "Necesito consultarlo",
        completionRate: 91,
      },
      aiInsight:
        "El 78% del revenue total proviene de esta oferta. Los cierres se concentran los días martes y jueves después de las 18hs según los datos de Calendly.",
    },
  ],

  proposition: {
    avatar: "coaches y mentores",
    result: "$100k/mes con un equipo autónomo",
    painRemoved: "trabajar 12 horas diarias apagando incendios",
    timeframe: "6 meses",
  },
};

export const mockSpatialNodes: SpatialProductNode[] = [
  {
    id: "avatar-main",
    type: "avatar",
    title: "Marcos, 34",
    subtitle: "Coach de negocios",
    badge: "Avatar principal",
    badgeColor: "bg-blue-500/15 text-blue-400",
    aiInsight: "Objeción nueva detectada en ventas",
    position: { x: "50%", y: "15%" },
    href: paths.platform.product.avatar("main"),
  },
  {
    id: "avatar-secondary",
    type: "avatar",
    title: "Laura, 28",
    subtitle: "Creadora de contenido",
    badge: "Sub-avatar",
    badgeColor: "bg-blue-500/10 text-blue-300",
    position: { x: "20%", y: "30%" },
    href: paths.platform.product.avatar("secondary"),
  },
  {
    id: "offer-1",
    type: "offer",
    title: "Programa Grupal",
    subtitle: "$1.500 · 12 semanas",
    badge: "Oferta entrada",
    badgeColor: "bg-violet-500/15 text-violet-400",
    aiInsight: "Tasa de cierre 68% este mes",
    position: { x: "16%", y: "62%" },
    href: paths.platform.product.offer("mid"),
  },
  {
    id: "offer-2",
    type: "offer",
    title: "Mentoría Individual",
    subtitle: "$3.000 · 6 meses",
    badge: "Oferta core",
    badgeColor: "bg-violet-500/20 text-violet-300",
    aiInsight: "Genera 78% del revenue total",
    position: { x: "84%", y: "62%" },
    href: paths.platform.product.offer("core"),
  },
  {
    id: "value-ladder",
    type: "value-ladder",
    title: "Escalera de valor",
    subtitle: "4 escalones · $97-$15k",
    badge: "Escalera",
    badgeColor: "bg-green-500/15 text-green-400",
    position: { x: "50%", y: "82%" },
    href: paths.platform.product.valueLadder,
  },
  {
    id: "proposition",
    type: "proposition",
    title: "Propuesta de valor",
    subtitle: "Coaches → 100k/mes",
    badge: "Mensaje",
    badgeColor: "bg-amber-500/15 text-amber-400",
    position: { x: "80%", y: "30%" },
    href: paths.platform.product.proposition,
  },
];

/** Líneas del canvas (coordenadas 0–100, viewBox) */
export const spatialConnections: { x1: number; y1: number; x2: number; y2: number }[] =
  [
    { x1: 50, y1: 50, x2: 50, y2: 18 },
    { x1: 50, y1: 50, x2: 22, y2: 28 },
    { x1: 50, y1: 50, x2: 18, y2: 55 },
    { x1: 50, y1: 50, x2: 82, y2: 55 },
    { x1: 50, y1: 50, x2: 50, y2: 82 },
    { x1: 50, y1: 50, x2: 78, y2: 25 },
  ];
