export type OtcClientField =
  | "name"
  | "email"
  | "nickname"
  | "join_date"
  | "status"
  | "total_amount"
  | "upfront_amount"
  | "fee_amount"
  | "fee_frequency"
  | "payment_type"
  | "platform"
  | "offered_product"
  | "is_success_case";

export const OTC_FIELDS: { key: OtcClientField; label: string; required?: boolean }[] = [
  { key: "name", label: "Nombre", required: true },
  { key: "email", label: "Email" },
  { key: "nickname", label: "Apodo / Alias" },
  { key: "join_date", label: "Fecha de ingreso" },
  { key: "status", label: "Estado (activo/inactivo)" },
  { key: "total_amount", label: "Monto total" },
  { key: "upfront_amount", label: "Anticipo" },
  { key: "fee_amount", label: "Cuota mensual" },
  { key: "fee_frequency", label: "Frecuencia de cuota" },
  { key: "payment_type", label: "Tipo de pago" },
  { key: "platform", label: "Plataforma de pago" },
  { key: "offered_product", label: "Producto ofrecido" },
  { key: "is_success_case", label: "Caso de éxito" },
];

const SYNONYMS: Record<OtcClientField, string[]> = {
  name: ["nombre", "name", "cliente", "contact", "contacto", "lead", "fullname", "nombrecompleto"],
  email: ["email", "correo", "mail", "correoelectronico", "emailaddress"],
  nickname: ["apodo", "nickname", "alias", "nick", "sobrenombre"],
  join_date: ["fecha", "date", "inicio", "ingreso", "fechaingreso", "joindate", "fechadeingreso", "start", "fechainicio"],
  status: ["estado", "status", "etapa", "stage", "situacion", "estado_cliente"],
  total_amount: ["monto", "amount", "valor", "total", "precio", "price", "importe", "inversion", "totalamount", "montototal"],
  upfront_amount: ["anticipo", "upfront", "adelanto", "enganche", "entrada", "pago_inicial", "pagoinicial"],
  fee_amount: ["cuota", "mensualidad", "fee", "monthly", "mensual", "cuotamensual", "fee_amount"],
  fee_frequency: ["frecuencia", "frequency", "periodicidad", "fee_frequency"],
  payment_type: ["tipo_pago", "payment_type", "tipodepago", "modalidad", "tipo_de_pago"],
  platform: ["plataforma", "platform", "canal", "channel", "medio", "payment_platform"],
  offered_product: ["producto", "product", "oferta", "servicio", "service", "programa", "plan", "course", "curso"],
  is_success_case: ["exito", "success", "caso_exito", "caso_de_exito", "testimonial", "testimonio"],
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function autoMapField(clickupFieldName: string): OtcClientField | null {
  const norm = normalize(clickupFieldName);
  for (const [otcField, synonyms] of Object.entries(SYNONYMS) as [OtcClientField, string[]][]) {
    if (synonyms.some((s) => normalize(s) === norm || norm.includes(normalize(s)) || normalize(s).includes(norm))) {
      return otcField;
    }
  }
  return null;
}

export type FieldMapping = {
  clickupField: string; // ClickUp field name (task.name for "name", custom field name for others)
  otcField: OtcClientField | null;
};

export type ClickUpFieldSource = {
  name: string;
  isBuiltin?: boolean; // task.name = true
};

export function buildAutoMapping(fields: ClickUpFieldSource[]): FieldMapping[] {
  return fields.map((f) => ({
    clickupField: f.name,
    otcField: f.isBuiltin ? "name" : autoMapField(f.name),
  }));
}
