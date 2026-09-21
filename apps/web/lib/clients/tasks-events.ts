/**
 * Aviso de que las tareas de un cliente cambiaron.
 *
 * ⭐ La ficha tiene dos secciones independientes que se cargan solas: las
 * sesiones 1-1 y las tareas. Subir una llamada crea tareas **en la otra
 * sección**, y sin este aviso la lista se queda como estaba hasta que alguien
 * recarga la página — que es exactamente el momento en que uno concluye que la
 * feature no funciona.
 *
 * Es un evento del navegador y no un estado compartido a propósito: las dos
 * secciones son hermanas sueltas dentro de la ficha, y subirles el estado al
 * padre obligaría a que la ficha entera sepa de tareas.
 */
export const CLIENT_TASKS_CHANGED = "limitless:client-tasks-changed";

export function notifyClientTasksChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CLIENT_TASKS_CHANGED));
}
