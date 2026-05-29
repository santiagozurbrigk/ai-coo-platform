/** Resultado serializable para mutaciones desde Server Actions (evita throws en el cliente). */
export type MutationResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

export async function runMutation<T>(
  fn: () => Promise<T>
): Promise<MutationResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
