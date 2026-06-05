export function log(message: string, ...args: unknown[]) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${message}`, ...args);
}

export function logError(message: string, ...args: unknown[]) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] ${message}`, ...args);
}
