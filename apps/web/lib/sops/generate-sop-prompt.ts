import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";

export function buildSOPGenerationPrompt(data: {
  goal: string;
  department: string;
  expectedOutcome: string;
  additionalContext?: string;
  orgContext: {
    orgName: string;
    industry?: string;
    teamSize?: number;
    salesScript?: string;
    existingSOPs?: Array<{ title: string; department: string }>;
  };
}): string {
  const existingSOPsText = data.orgContext.existingSOPs?.length
    ? `\nSOPs existentes en la organización:\n${wrapUntrustedContent(
        "sops_existentes",
        data.orgContext.existingSOPs
          .map((s) => `- ${s.title} (${s.department})`)
          .join("\n")
      )}`
    : "";

  const salesScriptContext = data.orgContext.salesScript
    ? `\nGuión de ventas de la organización:\n${wrapUntrustedContent(
        "guion_ventas",
        `${data.orgContext.salesScript.slice(0, 500)}...`
      )}`
    : "";

  return `Sos un experto en diseño de procesos operacionales para negocios de infoproductos latinoamericanos.

Creá un SOP (Procedimiento Operativo Estándar) profesional, específico y accionable para la siguiente organización.

CONTEXTO DE LA ORGANIZACIÓN:
- Empresa: ${data.orgContext.orgName}
- Industria: ${data.orgContext.industry ?? "Infoproductos / Coaching"}
${existingSOPsText}
${salesScriptContext}

DATOS DEL SOP A CREAR:
- Objetivo: ${data.goal}
- Departamento: ${data.department}
- Resultado esperado: ${data.expectedOutcome}
${data.additionalContext ? `- Contexto adicional: ${wrapUntrustedContent("contexto_adicional", data.additionalContext)}` : ""}

Generá el SOP en formato markdown estructurado. Devolvé ÚNICAMENTE un objeto JSON con esta estructura:

{
  "title": "<título conciso y descriptivo del SOP>",
  "summary": "<resumen ejecutivo en 2 oraciones>",
  "estimated_duration_minutes": <tiempo estimado para completar el proceso>,
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "content": "<el SOP completo en markdown con las siguientes secciones obligatorias>",
  "steps_count": <número de pasos principales>
}

El campo "content" debe contener markdown con EXACTAMENTE estas secciones:

## Objetivo
[Qué problema resuelve este SOP y por qué existe]

## Responsable
[Quién ejecuta este proceso — rol, no nombre]

## Cuándo usar este SOP
[Trigger o situación que activa este proceso]

## Prerrequisitos
[Qué necesitás tener antes de empezar]

## Pasos
### Paso 1: [Nombre del paso]
[Descripción detallada y accionable]
**Tiempo estimado:** X minutos
**Herramienta:** [tool o plataforma si aplica]

### Paso 2: [Nombre]
[...]

[continuar con todos los pasos necesarios]

## Errores comunes
[Lista de errores frecuentes y cómo evitarlos]

## Resultado esperado
[Cómo saber que el proceso se completó correctamente]

## Notas adicionales
[Información relevante, excepciones, o casos especiales]

IMPORTANTE:
- Sé específico para el contexto de ${data.orgContext.orgName}, no genérico
- Los pasos deben ser concretos y ejecutables
- Usá lenguaje informal pero profesional (tuteo)
- Devolvé SOLO el JSON, sin texto adicional ni markdown fence`;
}
