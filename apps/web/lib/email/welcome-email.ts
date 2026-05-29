const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://otc-plaform.vercel.app";

export function welcomeEmailTemplate({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111;">
  <p>Hola ${escapeHtml(name)},</p>
  <p>Tu workspace está configurado y listo para usar.</p>
  <p><strong>Accedé desde:</strong><br />
  <a href="${APP_URL}/login">${APP_URL}/login</a></p>
  <p><strong>Email:</strong> ${escapeHtml(email)}<br />
  <strong>Contraseña temporal:</strong> ${escapeHtml(password)}</p>
  <p>Te recomendamos cambiar tu contraseña en el primer acceso desde Configuración → Seguridad.</p>
  <p>Si tenés alguna duda, respondé este email o escribinos directamente.</p>
  <p>El equipo de Optimiza Tu Control</p>
</body>
</html>`;
}

export function welcomeEmailPlainText({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): string {
  return `Hola ${name},

Tu workspace está configurado y listo para usar.

Accedé desde:
${APP_URL}/login

Email: ${email}
Contraseña temporal: ${password}

Te recomendamos cambiar tu contraseña en el primer acceso desde Configuración → Seguridad.

El equipo de Optimiza Tu Control`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatCredentialsCopyBlock({
  organizationName,
  email,
  password,
}: {
  organizationName: string;
  email: string;
  password: string;
}): string {
  return `Organización: ${organizationName}
Email: ${email}
Contraseña temporal: ${password}
URL: ${APP_URL}/login`;
}
