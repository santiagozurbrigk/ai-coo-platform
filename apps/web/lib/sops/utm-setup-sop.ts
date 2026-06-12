export const UTM_SETUP_SOP = {
  title: "Cómo configurar UTMs para trackear YouTube",
  department: "Marketing",
  steps: [
    {
      step: 1,
      title: "Crear el UTM en OTC",
      description:
        "Ir a Marketing → UTMs → Nuevo UTM. Seleccionar el video de YouTube, tu usuario de Instagram y dónde va a estar el link (descripción, comentario, bio).",
    },
    {
      step: 2,
      title: "Copiar los links generados",
      description:
        "OTC genera dos links: landing con UTM y DM directo de Instagram. Copiá cada uno con los botones de copiar.",
    },
    {
      step: 3,
      title: "Pegar los links en YouTube",
      description:
        "OTC genera dos links: uno para tu landing page y uno para tu DM de Instagram. Pegalos en la descripción del video. El link de DM directo es el más efectivo porque lleva al lead directo a una conversación con tu bot.",
    },
    {
      step: 4,
      title: "Verificar la atribución",
      description:
        "Cuando un lead clickea el link de DM, OTC detecta automáticamente que vino de ese video. Lo vas a ver en Marketing → UTMs y también en el perfil del lead en el inbox de ventas.",
    },
    {
      step: 5,
      title: "Hacer esto con cada video nuevo",
      description:
        "Cada video que publiques debe tener su propio UTM con utm_campaign único. Así OTC puede atribuir leads y ventas a cada pieza de contenido.",
    },
  ],
  warning:
    "Si el proceso de tracking no está configurado desde el principio, es lo mismo que no tener nada. Crear el UTM ANTES de publicar el video.",
} as const;
