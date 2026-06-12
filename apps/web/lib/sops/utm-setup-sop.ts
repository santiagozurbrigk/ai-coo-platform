export const UTM_SETUP_SOP = {
  title: "Cómo configurar UTMs para trackear YouTube",
  department: "Marketing",
  steps: [
    {
      step: 1,
      title: "Crear el UTM en OTC",
      description:
        "Ir a Marketing → UTMs → Nuevo UTM. Seleccionar el video de YouTube y elegir dónde va a estar el link (descripción, comentario, bio).",
    },
    {
      step: 2,
      title: "Copiar el link generado",
      description:
        'OTC genera automáticamente el UTM. Copiar el link completo con el botón "Copiar URL".',
    },
    {
      step: 3,
      title: "Pegar en YouTube",
      description:
        'Editar el video en YouTube Studio. En la descripción, agregar el link UTM como primer link visible. Recomendado: "👉 [nombre de tu oferta]: [link con UTM]".',
    },
    {
      step: 4,
      title: "Verificar que funciona",
      description:
        "Abrir el link desde el video. En OTC → Marketing → UTMs debería aparecer +1 en la columna Clicks dentro de los próximos minutos.",
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
