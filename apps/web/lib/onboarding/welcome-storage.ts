const PENDING_KEY = "ai-coo-welcome-pending";
const SEEN_KEY = "ai-coo-welcome-seen";

/** Marca que la animación de bienvenida debe reproducirse en la siguiente visita al panel. */
export function markWelcomePending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, "true");
}

export function shouldPlayWelcome(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(SEEN_KEY) === "true") return false;
  return sessionStorage.getItem(PENDING_KEY) === "true";
}

export function completeWelcome(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
  localStorage.setItem(SEEN_KEY, "true");
}

export function clearWelcomeStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(SEEN_KEY);
}
