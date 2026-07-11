import type Anthropic from "@anthropic-ai/sdk";
import { ALL_PROPOSAL_TOOLS } from "@/lib/agent/graph-proposal-tools";

export const GENERATE_DOCUMENT_TOOL: Anthropic.Tool = {
  name: "generate_document",
  description:
    "Genera un archivo DESCARGABLE con datos tabulares (Excel/CSV) o, excepcionalmente, un documento binario (docx/pdf).\n\n" +
    "USAR SOLO cuando el usuario pide explícitamente un archivo exportable en un formato concreto: " +
    "\"exportame esto a Excel\", \"dame un CSV con las ventas\", \"generá un xlsx\".\n\n" +
    "NO USAR para SOPs, reportes, resúmenes, propuestas, guías ni cualquier documento de texto largo: " +
    "esos van al panel Canvas como markdown (simplemente escribí el contenido en tu respuesta, el sistema lo detecta). " +
    "Si dudás entre Canvas y esta tool, elegí Canvas — esta tool es solo para archivos que el usuario necesita descargar.\n\n" +
    "Ejemplos que SÍ la ameritan: \"pasame la lista de tareas a Excel\", \"quiero un CSV de las piezas de contenido\".\n" +
    "Ejemplos que NO: \"armame un SOP de onboarding\" (→ Canvas), \"hacé un reporte de la semana\" (→ Canvas).",
  input_schema: {
    type: "object" as const,
    required: ["format", "filename", "content"],
    properties: {
      format: {
        type: "string",
        enum: ["docx", "xlsx", "pdf", "csv"],
        description:
          "Formato del archivo. Preferí 'xlsx' o 'csv' para datos tabulares. Usá 'docx'/'pdf' solo si el usuario lo pide explícitamente.",
      },
      filename: {
        type: "string",
        description:
          "Nombre del archivo SIN extensión ni ruta. Ejemplo: 'ventas-enero' (no 'ventas-enero.xlsx').",
      },
      content: {
        type: "object",
        description:
          "Contenido del documento. Para docx/pdf: { paragraphs: [{ text, style? }] }. Para xlsx/csv: { headers: [...], rows: [[...]] }. Ejemplo xlsx: { headers: [\"Tarea\",\"Estado\"], rows: [[\"Editar reel\",\"todo\"]] }.",
        properties: {
          paragraphs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                style: {
                  type: "string",
                  enum: ["heading1", "heading2", "heading3", "body", "bullet"],
                },
              },
              required: ["text"],
            },
          },
          headers: { type: "array", items: { type: "string" } },
          rows: {
            type: "array",
            items: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  },
};

export const CREATE_WORKBOARD_TASKS_TOOL: Anthropic.Tool = {
  name: "create_workboard_tasks",
  description:
    "Crea una o más tareas NUEVAS en el Tablero de Trabajo (kanban operativo del negocio).\n\n" +
    "USAR cuando el usuario quiere agregar trabajo pendiente al tablero: \"agregá estas tareas al board\", " +
    "\"anotá que hay que editar 3 reels\", \"creá una tarea para llamar al cliente el viernes\". " +
    "Preferí esta tool en vez de listar tareas en texto: así quedan registradas y accionables.\n\n" +
    "NO USAR para modificar una tarea que ya existe (→ update_workboard_task, buscándola antes con search_workboard_tasks). " +
    "NO USAR para consultar o listar tareas existentes (→ search_workboard_tasks).\n\n" +
    "Ejemplo: usuario dice \"esta semana tengo que grabar 2 videos y armar la propuesta para Acme\" → creá 3 tareas.",
  input_schema: {
    type: "object" as const,
    required: ["tasks"],
    properties: {
      tasks: {
        type: "array",
        description: "Lista de tareas a crear. Cada tarea requiere al menos un 'title'.",
        items: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              description: "Título corto y accionable. Ejemplo: 'Editar reel de testimonios'.",
            },
            description: {
              type: "string",
              description: "Detalle opcional de la tarea (contexto, subtareas, links).",
            },
            area: {
              type: "string",
              enum: [
                "marketing",
                "ventas",
                "operaciones",
                "finanzas",
                "clientes",
                "general",
              ],
              description:
                "Área del negocio. Inferila del contenido: contenido/reels → 'marketing', cierres/leads → 'ventas', entregas/procesos → 'operaciones'. Si no está claro, usá 'general'.",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Prioridad. Default razonable: 'medium'.",
            },
            due_date: {
              type: "string",
              description:
                "Fecha límite en formato YYYY-MM-DD usando el año actual, o null si no hay. Convertí referencias relativas ('el viernes', 'la semana que viene') a fecha concreta según la fecha actual del contexto.",
            },
            assignee_name: {
              type: "string",
              description:
                "Nombre completo del responsable tal como figura en el equipo (profiles.full_name). Omitir si el usuario no lo indica.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Etiquetas opcionales para agrupar tareas.",
            },
          },
        },
      },
    },
  },
};

export const SEARCH_WORKBOARD_TASKS_TOOL: Anthropic.Tool = {
  name: "search_workboard_tasks",
  description:
    "Busca y lista tareas EXISTENTES en el Tablero de Trabajo por texto del título y/o estado.\n\n" +
    "USAR en dos casos: (1) el usuario pregunta qué tareas hay (\"¿qué tengo pendiente?\", \"mostrame las tareas de ventas en progreso\"); " +
    "(2) como PASO PREVIO OBLIGATORIO a update_workboard_task, para obtener el 'id' real de la tarea a modificar.\n\n" +
    "NO USAR para crear tareas (→ create_workboard_tasks).\n\n" +
    "Ejemplo: usuario dice \"marcá como hecha la tarea del reel de testimonios\" → primero buscá con query='reel testimonios', después llamá update_workboard_task con el id encontrado.",
  input_schema: {
    type: "object" as const,
    required: ["query"],
    properties: {
      query: {
        type: "string",
        description:
          "Texto a buscar dentro del título de la tarea. Usá palabras clave, no la frase exacta del usuario. Para traer todo, pasá una cadena vacía ''.",
      },
      status: {
        type: "string",
        enum: ["todo", "in_progress", "review", "done"],
        description:
          "Filtro opcional por estado. Omitir para buscar en todos los estados.",
      },
    },
  },
};

export const UPDATE_WORKBOARD_TASK_TOOL: Anthropic.Tool = {
  name: "update_workboard_task",
  description:
    "Modifica una tarea que YA existe en el Tablero de Trabajo (cambiar estado, título, área, prioridad, fecha o responsable).\n\n" +
    "REGLA DE DECISIÓN: llamá siempre a search_workboard_tasks PRIMERO para obtener el 'task_id' real. Nunca inventes el id.\n\n" +
    "NO USAR para crear tareas nuevas (→ create_workboard_tasks).\n\n" +
    "Ejemplo típico: mover una tarea a 'done' → { task_id: <id de la búsqueda>, updates: { status: 'done' } }.",
  input_schema: {
    type: "object" as const,
    required: ["task_id", "updates"],
    properties: {
      task_id: {
        type: "string",
        description:
          "UUID EXACTO de la tarea, obtenido de search_workboard_tasks. No inventar ni adivinar.",
      },
      updates: {
        type: "object",
        description: "Campos a modificar. Incluí solo los que cambian.",
        properties: {
          title: { type: "string", description: "Nuevo título." },
          description: { type: "string", description: "Nueva descripción." },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "review", "done"],
            description: "Nuevo estado en el kanban.",
          },
          area: {
            type: "string",
            enum: [
              "marketing",
              "ventas",
              "operaciones",
              "finanzas",
              "clientes",
              "general",
            ],
            description: "Nueva área del negocio.",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Nueva prioridad.",
          },
          due_date: {
            type: "string",
            description:
              "Nueva fecha límite YYYY-MM-DD (año actual), o null para quitar la fecha.",
          },
          assignee_name: {
            type: "string",
            description:
              "Nombre completo del nuevo responsable, o null para desasignar.",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Reemplaza el set de etiquetas de la tarea.",
          },
        },
      },
    },
  },
};

export const ANALYZE_CONTENT_PIECE_TOOL: Anthropic.Tool = {
  name: "analyze_content_piece",
  description:
    "Analiza UNA pieza de contenido concreta del módulo Contenido y detecta su Formato, Dolor y Ángulo " +
    "(descarga el archivo de Drive, transcribe con Whisper y analiza lo visual con Claude Vision).\n\n" +
    "USAR cuando el usuario pide entender por qué funcionó/no funcionó una pieza puntual o clasificarla: " +
    "\"analizá este reel\", \"¿qué ángulo usa este video?\".\n\n" +
    "REQUISITO: necesitás el 'content_piece_id'. Si el usuario menciona la pieza por título o tema y no tenés el id, " +
    "primero conseguilo con get_top_performing_content u otra búsqueda; no inventes el id.\n\n" +
    "NO USAR para rankear varias piezas (→ get_top_performing_content) ni para crear variaciones (→ create_content_variants).",
  input_schema: {
    type: "object" as const,
    required: ["content_piece_id"],
    properties: {
      content_piece_id: {
        type: "string",
        description:
          "UUID EXACTO de la pieza en la tabla content_pieces. Debe provenir del sistema, no inventarse.",
      },
    },
  },
};

export const CREATE_CONTENT_VARIANTS_TOOL: Anthropic.Tool = {
  name: "create_content_variants",
  description:
    "Genera N variaciones (briefs de guion) a partir de una pieza de contenido existente que funcionó bien, " +
    "para replicar su éxito. Cada variante incluye Formato, Dolor, Ángulo y estructura parte por parte. " +
    "Se guardan en el módulo Contenido bajo la pieza original.\n\n" +
    "USAR cuando el usuario quiere producir más contenido basado en algo que ya anduvo: " +
    "\"hacé 3 variaciones de este reel\", \"quiero más videos como este que vendió bien\".\n\n" +
    "REQUISITO: necesitás el 'source_content_id' real. Si no lo tenés, conseguilo con get_top_performing_content primero.\n\n" +
    "NO USAR para clasificar una pieza (→ analyze_content_piece) ni para consultar métricas (→ get_top_performing_content).",
  input_schema: {
    type: "object" as const,
    required: ["source_content_id", "count"],
    properties: {
      source_content_id: {
        type: "string",
        description:
          "UUID EXACTO de la pieza fuente (la que se quiere replicar). Debe provenir del sistema.",
      },
      count: {
        type: "number",
        description: "Cantidad de variantes a generar. Rango válido: 1 a 5. Si el usuario no lo dice, usá 3.",
      },
      instructions: {
        type: "string",
        description:
          "Opcional. Qué explorar o cambiar en las variantes (ej: 'probar un ángulo más agresivo', 'apuntar a otro avatar').",
      },
    },
  },
};

export const GET_TOP_PERFORMING_CONTENT_TOOL: Anthropic.Tool = {
  name: "get_top_performing_content",
  description:
    "Devuelve un RANKING de piezas de contenido ordenadas por una métrica (engagement o proxy de ventas). " +
    "Es también la forma principal de LISTAR piezas y obtener sus IDs y títulos.\n\n" +
    "USAR cuando el usuario pregunta qué contenido rindió mejor (\"¿qué reel trajo más clientes?\", " +
    "\"top 5 posts por guardados\") o cuando necesitás encontrar el id de una pieza que el usuario mencionó por tema/título, " +
    "antes de analyze_content_piece o create_content_variants.\n\n" +
    "NO USAR para analizar una sola pieza en profundidad (→ analyze_content_piece).",
  input_schema: {
    type: "object" as const,
    required: ["metric"],
    properties: {
      metric: {
        type: "string",
        enum: [
          "likes",
          "comments",
          "saves",
          "shares",
          "reach",
          "engagement_total",
          "sales",
        ],
        description:
          "Métrica para ordenar. Para 'cuál trajo más clientes/ventas' usá 'sales' (aproximado con guardados). Para engagement general usá 'engagement_total'.",
      },
      limit: {
        type: "number",
        description: "Cantidad de piezas a retornar. Default: 10. Máximo: 50.",
      },
      type_filter: {
        type: "string",
        enum: ["reel", "post", "carousel", "youtube", "story", "all"],
        description: "Filtro por tipo de contenido. Default: 'all'.",
      },
    },
  },
};

export const AGENT_CHAT_TOOLS: Anthropic.Tool[] = [
  GENERATE_DOCUMENT_TOOL,
  CREATE_WORKBOARD_TASKS_TOOL,
  SEARCH_WORKBOARD_TASKS_TOOL,
  UPDATE_WORKBOARD_TASK_TOOL,
  ANALYZE_CONTENT_PIECE_TOOL,
  CREATE_CONTENT_VARIANTS_TOOL,
  GET_TOP_PERFORMING_CONTENT_TOOL,
  ...ALL_PROPOSAL_TOOLS,
];
