/**
 * Script temporal para probar markTransactionAsCompleted
 * Ejecuta con: npx tsx test-transaction.ts
 */

import { markTransactionAsCompleted } from "./app/(dashboard)/transacciones/actions";

async function testMarkTransactionAsPaid() {
  const testData = {
    transaction_id: "PASTE_YOUR_TEST_TRANSACTION_ID_HERE",
    payment_method: "cash" as const,
    notes: "Pago verificado por cliente",
  };

  console.log("🧪 Testing markTransactionAsCompleted...");
  console.log("Payload:", testData);

  const result = await markTransactionAsCompleted(testData);

  console.log("\n📊 Result:");
  console.log(JSON.stringify(result, null, 2));

  if (result.success) {
    console.log("\n✅ ¡Éxito! Ahora verifica en Supabase:");
    console.log("1. Transacción → status debe ser 'completed'");
    console.log("2. Suscripción → status debe ser 'active'");
  } else {
    console.log("\n❌ Error:", result.error);
  }
}

testMarkTransactionAsPaid().catch(console.error);
