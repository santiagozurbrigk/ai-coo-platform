const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
const BARE_URL_RE = /https?:\/\/[^\s)\]>]+/gi;

/** Quita links de descarga y URLs del texto visible en el chat. */
export function stripDownloadUrls(text: string): string {
  let result = text
    .replace(MARKDOWN_LINK_RE, "$1")
    .replace(BARE_URL_RE, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  result = result
    .replace(/descarg[aá].{0,40}(documento|archivo|link|enlace)/gi, "")
    .replace(/pod[eé]s descargarlo.{0,80}/gi, "")
    .trim();

  return result;
}

export function buildCanvasChatIntro(title?: string): string {
  const label = title?.trim() ? `"${title.trim()}"` : "El documento";
  return `${label} está listo en el panel Canvas.\n\nPodés descargarlo con el ícono de descarga en la barra del Canvas.`;
}
