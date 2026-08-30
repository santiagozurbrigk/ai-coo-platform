import { brand, brandColors } from "@/lib/brand";


/** Email de notificación: Trial Reels terminados de publicar */

export type TrialReelsDoneEmailParams = {
  to: string;
  published: number;
  failed: number;
  appUrl: string;
};

export function trialReelsDoneEmailTemplate(params: TrialReelsDoneEmailParams): string {
  const { published, failed, appUrl } = params;
  const total = published + failed;
  const allOk = failed === 0;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Trial Reels publicados</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${brandColors.primary};padding:28px 32px;">
              <p style="margin:0;color:#000000;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;opacity:0.75;">${brand.wordmark} · Trial Reels</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
                ${allOk ? "Tus reels están en Zernio" : "Publicación completada"}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
                ${allOk
                  ? `Las <strong>${published}</strong> variante${published === 1 ? "" : "s"} de tu Trial Reel se publicaron como borrador en Zernio. Revisalas y confirmá la publicación desde tu cuenta.`
                  : `De las <strong>${total}</strong> variantes programadas, <strong>${published}</strong> se publicaron correctamente${failed > 0 ? ` y <strong>${failed}</strong> fallaron` : ""}.`
                }
              </p>

              <!-- Stats -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  ${published > 0 ? `
                  <td style="width:${failed > 0 ? "50%" : "100%"};padding-right:${failed > 0 ? "8px" : "0"};">
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${published}</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#15803d;font-weight:500;">Publicada${published === 1 ? "" : "s"}</p>
                    </div>
                  </td>` : ""}
                  ${failed > 0 ? `
                  <td style="${published > 0 ? "width:50%;padding-left:8px;" : "width:100%;"}">
                    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;text-align:center;">
                      <p style="margin:0;font-size:28px;font-weight:700;color:#dc2626;">${failed}</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#b91c1c;font-weight:500;">Con error</p>
                    </div>
                  </td>` : ""}
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/marketing/content"
                       style="display:inline-block;background:${brandColors.primary};color:#000000;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
                      Ver en ${brand.name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                ${brand.wordmark} · ${brand.legalName} · Este email fue generado automáticamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function trialReelsDoneEmailText(params: TrialReelsDoneEmailParams): string {
  const { published, failed, appUrl } = params;
  const lines = [
    `${brand.wordmark} · Trial Reels`,
    "",
    `Publicación completada: ${published} publicada${published === 1 ? "" : "s"}${failed > 0 ? `, ${failed} con error` : ""}.`,
    "",
    `Revisá el resultado en: ${appUrl}/marketing/content`,
  ];
  return lines.join("\n");
}
