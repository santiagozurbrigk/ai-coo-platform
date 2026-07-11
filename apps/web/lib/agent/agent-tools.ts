import type Anthropic from "@anthropic-ai/sdk";
import { ALL_PROPOSAL_TOOLS } from "@/lib/agent/graph-proposal-tools";

export const GENERATE_DOCUMENT_TOOL: Anthropic.Tool = {
  name: "generate_document",
  description:
    "Genera datos tabulares exportables (Excel/CSV). NO uses esta tool para SOPs, reportes ni documentos de texto — esos van al Canvas en markdown. Nunca devuelvas ni menciones URLs de descarga al usuario.",
  input_schema: {
    type: "object" as const,
    required: ["format", "filename", "content"],
    properties: {
      format: {
        type: "string",
        enum: ["docx", "xlsx", "pdf", "csv"],
        description: "Formato del archivo",
      },
      filename: {
        type: "string",
        description: "Nombre del archivo sin extensión (ej: 'propuesta-comercial')",
      },
      content: {
        type: "object",
        description:
          "Contenido del documento. Para docx/pdf: { paragraphs: [{ text, style? }] }. Para xlsx/csv: { headers: [...], rows: [[...]] }",
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
    "Crea una o más tareas directamente en el Tablero de Trabajo de OTC. SIEMPRE usar esta herramienta (en lugar de listar tareas en texto) cuando el usuario pida agregar tareas al tablero, board, kanban o tablero de trabajo. Las fechas deben estar en formato YYYY-MM-DD usando el año actual.",
  input_schema: {
    type: "object" as const,
    required: ["tasks"],
    properties: {
      tasks: {
        type: "array",
        items: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
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
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
            due_date: {
              type: "string",
              description: "YYYY-MM-DD usando el año actual, o null",
            },
            assignee_name: {
              type: "string",
              description: "Nombre completo del responsable según profiles.full_name",
            },
            tags: {
              type: "array",
              items: { type: "string" },
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
    "Busca tareas en el Tablero de Trabajo por nombre. Usar ANTES de update_workboard_task para obtener el ID de la tarea a modificar.",
  input_schema: {
    type: "object" as const,
    required: ["query"],
    properties: {
      query: {
        type: "string",
        description: "Texto a buscar en el título de la tarea",
      },
      status: {
        type: "string",
        enum: ["todo", "in_progress", "review", "done"],
        description: "Filtrar por estado (opcional)",
      },
    },
  },
};

export const UPDATE_WORKBOARD_TASK_TOOL: Anthropic.Tool = {
  name: "update_workboard_task",
  description:
    "Modifica una tarea existente en el Tablero de Trabajo. Requiere el ID de la tarea (obtenerlo con search_workboard_tasks primero). Puede actualizar título, descripción, estado, área, prioridad, fecha límite y responsable.",
  input_schema: {
    type: "object" as const,
    required: ["task_id", "updates"],
    properties: {
      task_id: {
        type: "string",
        description: "UUID de la tarea (obtener con search_workboard_tasks)",
      },
      updates: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "review", "done"],
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
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          due_date: {
            type: "string",
            description: "YYYY-MM-DD usando el año actual, o null para quitar la fecha",
          },
          assignee_name: {
            type: "string",
            description: "Nombre completo del responsable, o null para desasignar",
          },
          tags: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
};

export const ANALYZE_CONTENT_PIECE_TOOL: Anthropic.Tool = {
  name: "analyze_content_piece",
  description:
    "Analiza una pieza de contenido del módulo Marketing e identifica su Formato, Dolor y Ángulo. Descarga el archivo de Drive, lo transcribe con Whisper y usa Claude Vision para el análisis visual. Requiere que la pieza tenga un archivo de Drive vinculado.",
  input_schema: {
    type: "object" as const,
    required: ["content_piece_id"],
    properties: {
      content_piece_id: {
        type: "string",
        description: "ID de la pieza de contenido en content_pieces",
      },
    },
  },
};

export const CREATE_CONTENT_VARIANTS_TOOL: Anthropic.Tool = {
  name: "create_content_variants",
  description:
    "Genera N variantes de una pieza de contenido existente. Cada variante es un brief con Formato, Dolor, Ángulo y estructura detallada del video parte por parte. Las variantes se guardan en la DB y aparecen en el módulo Contenido bajo la pieza original.",
  input_schema: {
    type: "object" as const,
    required: ["source_content_id", "count"],
    properties: {
      source_content_id: {
        type: "string",
        description: "ID de la pieza de contenido fuente (la que se quiere variar)",
      },
      count: {
        type: "number",
        description: "Cantidad de variantes a generar (1-5)",
      },
      instructions: {
        type: "string",
        description:
          "Instrucciones adicionales sobre qué cambiar o explorar en las variantes",
      },
    },
  },
};

export const GET_TOP_PERFORMING_CONTENT_TOOL: Anthropic.Tool = {
  name: "get_top_performing_content",
  description:
    "Obtiene el ranking de piezas de contenido por métricas de engagement o por correlación con ventas cerradas. Útil para responder cuál reel trajo más clientes o qué contenido tuvo más engagement.",
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
          "Métrica por la que rankear. 'sales' usa saves como proxy hasta cruzar con inbox.",
      },
      limit: {
        type: "number",
        description: "Cantidad de piezas a retornar (default: 10)",
      },
      type_filter: {
        type: "string",
        enum: ["reel", "post", "carousel", "youtube", "story", "all"],
        description: "Filtrar por tipo de contenido. Default: 'all'",
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
