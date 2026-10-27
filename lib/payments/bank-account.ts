/**
 * Datos bancarios de RGL Estudio para pagos por transferencia manual.
 *
 * Se muestran al cliente en el checkout cuando elige "Transferencia".
 * El cliente transfiere a esta cuenta y luego sube el comprobante.
 *
 * ⚠️ REEMPLAZAR los placeholders por los datos reales de Ruth antes de
 * pasar a produccion. Es el unico lugar donde viven estos datos.
 */
export type BankAccount = {
  bank: string;
  accountType: string;
  accountNumber: string;
  holder: string;
  identification: string;
  email?: string;
};

export const RGL_BANK_ACCOUNT: BankAccount = {
  bank: "Banco Pichincha",
  accountType: "Cuenta de Ahorros",
  accountNumber: "2205311312",
  holder: "Ruth Gómez Lescano",
  identification: "1805082474",
  email: "info@rglestudio.com",
};

/** Etiquetas legibles para renderizar la cuenta en la UI. */
export const BANK_ACCOUNT_FIELDS: { label: string; key: keyof BankAccount }[] = [
  { label: "Banco", key: "bank" },
  { label: "Tipo de cuenta", key: "accountType" },
  { label: "Número de cuenta", key: "accountNumber" },
  { label: "Titular", key: "holder" },
  { label: "Cédula", key: "identification" },
  { label: "Correo de contacto", key: "email" },
];
