import type Anthropic from "@anthropic-ai/sdk";

// ─── get_business_snapshot ────────────────────────────────────────────────────
export const GET_BUSINESS_SNAPSHOT_TOOL: Anthropic.Tool = {
  name: "get_business_snapshot",
  description:
    "Obtiene un snapshot completo del estado actual del negocio: KPIs de ventas, clientes, marketing, finanzas y operaciones.\n\n" +
    "CUÁNDO USAR: preguntas generales sobre el negocio ('cómo voy', 'cómo está el negocio', 'dame un resumen', 'qué está pasando'), " +
    "o cuando necesitás contexto multi-módulo para responder una pregunta estratégica. " +
    "También usala al inicio de preguntas de diagnóstico antes de profundizar en un módulo específico.\n\n" +
    "NO USAR si la pregunta es específica de un solo módulo — en ese caso usá la tool específica (get_clients_data, get_sales_metrics, etc.).",
  input_schema: {
    type: "object" as const,
    properties: {
      period_days: {
        type: "number",
        description:
          "Período en días a analizar (default: 30). Ejemplos: 7 para esta semana, 30 para este mes, 90 para el trimestre.",
      },
    },
    required: [],
  },
};

// ─── get_clients_data ─────────────────────────────────────────────────────────
export const GET_CLIENTS_DATA_TOOL: Anthropic.Tool = {
  name: "get_clients_data",
  description:
    "Accede a los datos del CRM: lista de clientes, estado, revenue y actividad reciente.\n\n" +
    "CUÁNDO USAR: preguntas sobre clientes ('cuántos clientes activos tengo', 'quiénes son mis mejores clientes', " +
    "'qué clientes están en riesgo', 'cómo evoluciona mi base de clientes').\n\n" +
    "Devuelve: total de clientes por estado, top clientes por revenue, últimos incorporados, distribución de montos.",
  input_schema: {
    type: "object" as const,
    properties: {
      status_filter: {
        type: "string",
        enum: ["all", "active", "inactive", "lead", "closed"],
        description: "Filtrar por estado. Default: 'all'.",
      },
      limit: {
        type: "number",
        description: "Máximo de clientes a devolver (default 20, max 50).",
      },
    },
    required: [],
  },
};

// ─── get_sales_metrics ────────────────────────────────────────────────────────
export const GET_SALES_METRICS_TOOL: Anthropic.Tool = {
  name: "get_sales_metrics",
  description:
    "Métricas de ventas y cierre: tasa de cierre, ticket promedio, ranking del equipo de closers, evolución.\n\n" +
    "CUÁNDO USAR: preguntas sobre performance de ventas ('cuál es mi tasa de cierre', 'cómo está el equipo', " +
    "'cuántas llamadas cerramos este mes', 'cómo mejorar las ventas', 'qué closer está mejor').\n\n" +
    "Devuelve: resumen de llamadas del período, tasa de cierre global, ranking por closer con scores Fathom, objeciones frecuentes.",
  input_schema: {
    type: "object" as const,
    properties: {
      period_days: {
        type: "number",
        description: "Período en días (default: 30).",
      },
    },
    required: [],
  },
};

// ─── get_closing_calls ────────────────────────────────────────────────────────
export const GET_CLOSING_CALLS_TOOL: Anthropic.Tool = {
  name: "get_closing_calls",
  description:
    "Lista las llamadas de cierre recientes con sus análisis de Fathom: scores, fortalezas, debilidades, resultado.\n\n" +
    "CUÁNDO USAR: análisis profundo de llamadas específicas ('cuáles fueron las últimas llamadas', " +
    "'por qué se perdieron esos cierres', 'qué patrones tienen las llamadas exitosas', 'qué dice Fathom de las llamadas').\n\n" +
    "Devuelve: llamadas con fecha, closer, score, resultado (ganada/perdida/pendiente), resumen del análisis si existe.",
  input_schema: {
    type: "object" as const,
    properties: {
      limit: {
        type: "number",
        description: "Cantidad de llamadas a devolver (default 10, max 30).",
      },
      result_filter: {
        type: "string",
        enum: ["all", "won", "lost", "pending"],
        description: "Filtrar por resultado. Default: 'all'.",
      },
    },
    required: [],
  },
};

// ─── get_finance_summary ──────────────────────────────────────────────────────
export const GET_FINANCE_SUMMARY_TOOL: Anthropic.Tool = {
  name: "get_finance_summary",
  description:
    "Resumen financiero: ingresos cobrados, gastos fijos, suscripciones, compensación del equipo y resultado neto.\n\n" +
    "CUÁNDO USAR: preguntas financieras ('cuánto gané este mes', 'cuáles son mis gastos fijos', " +
    "'cuál es mi margen', 'cómo está la caja', 'cuánto gasto en el equipo').\n\n" +
    "Devuelve: ingresos del período (pagos de clientes), gastos configurados (fijos + suscripciones + equipo), resultado estimado.",
  input_schema: {
    type: "object" as const,
    properties: {
      period_days: {
        type: "number",
        description: "Período en días para ingresos (default: 30).",
      },
    },
    required: [],
  },
};

// ─── get_marketing_overview ───────────────────────────────────────────────────
export const GET_MARKETING_OVERVIEW_TOOL: Anthropic.Tool = {
  name: "get_marketing_overview",
  description:
    "Resumen del módulo marketing: contenido publicado, métricas de engagement, lead magnets y conversión.\n\n" +
    "CUÁNDO USAR: preguntas sobre marketing ('cómo está rindiendo el contenido', 'qué publicamos últimamente', " +
    "'cuántos leads captamos', 'qué LM convierte mejor', 'cómo está el engagement').\n\n" +
    "Devuelve: piezas de contenido recientes con métricas, LMs activos con tasa de conversión, totales de leads.",
  input_schema: {
    type: "object" as const,
    properties: {
      period_days: {
        type: "number",
        description: "Período en días (default: 30).",
      },
    },
    required: [],
  },
};

// ─── get_lead_magnets_data ────────────────────────────────────────────────────
export const GET_LEAD_MAGNETS_DATA_TOOL: Anthropic.Tool = {
  name: "get_lead_magnets_data",
  description:
    "Datos completos de lead magnets: métricas por LM, leads captados, tasa de conversión a clientes, revenue atribuido.\n\n" +
    "CUÁNDO USAR: preguntas específicas sobre LMs ('cuál LM convierte mejor', 'cuántos leads tengo', " +
    "'qué lead magnet me trae más clientes', 'cuánto revenue viene de los LMs').\n\n" +
    "Devuelve: lista de LMs activos con leads, clientes atribuidos, conversión y revenue.",
  input_schema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

// ─── get_operations_summary ───────────────────────────────────────────────────
export const GET_OPERATIONS_SUMMARY_TOOL: Anthropic.Tool = {
  name: "get_operations_summary",
  description:
    "Estado de operaciones: inputs semanales del equipo, SOPs existentes e inteligencia del negocio.\n\n" +
    "CUÁNDO USAR: preguntas operativas ('qué reportó el equipo esta semana', 'qué SOPs tenemos', " +
    "'cómo está la operación', 'qué bloqueadores hay', 'cómo está el equipo').\n\n" +
    "Devuelve: inputs de la semana actual por área, lista de SOPs, último snapshot de inteligencia si existe.",
  input_schema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

// ─── Export list ──────────────────────────────────────────────────────────────
export const ALL_DATA_READER_TOOLS: Anthropic.Tool[] = [
  GET_BUSINESS_SNAPSHOT_TOOL,
  GET_CLIENTS_DATA_TOOL,
  GET_SALES_METRICS_TOOL,
  GET_CLOSING_CALLS_TOOL,
  GET_FINANCE_SUMMARY_TOOL,
  GET_MARKETING_OVERVIEW_TOOL,
  GET_LEAD_MAGNETS_DATA_TOOL,
  GET_OPERATIONS_SUMMARY_TOOL,
];

export const DATA_READER_TOOL_NAMES = new Set([
  "get_business_snapshot",
  "get_clients_data",
  "get_sales_metrics",
  "get_closing_calls",
  "get_finance_summary",
  "get_marketing_overview",
  "get_lead_magnets_data",
  "get_operations_summary",
] as const);
