/**
 * Bucket privado de Supabase Storage para comprobantes de pago.
 * Crear en Supabase Dashboard → Storage → New bucket
 * Name: client-payment-receipts | Public: false
 */
export const CLIENT_PAYMENT_RECEIPTS_BUCKET = "client-payment-receipts";

export const CLIENT_PAYMENT_RECEIPTS_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const CLIENT_PAYMENT_RECEIPTS_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp";
