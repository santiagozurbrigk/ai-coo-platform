import { clearWelcomeStorage } from "@/lib/onboarding/welcome-storage";

const COMPLETE_KEY = "ai-coo-onboarding-complete";
const DATA_KEY = "ai-coo-onboarding-data";

/** Fase 0: primer login = onboarding no completado. */
export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COMPLETE_KEY) === "true";
}

export function markOnboardingComplete(): void {
  localStorage.setItem(COMPLETE_KEY, "true");
}

export function saveOnboardingDraft(data: unknown): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function loadOnboardingDraft<T>(): T | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearOnboardingState(): void {
  localStorage.removeItem(COMPLETE_KEY);
  localStorage.removeItem(DATA_KEY);
  clearWelcomeStorage();
}
