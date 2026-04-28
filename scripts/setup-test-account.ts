import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitamos el service key para bypassear RLS

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupTestAccount() {
  const email = "cramos6303@uta.edu.ec";
  
  console.log(`Buscando usuario: ${email}...`);
  // 1. Obtener el ID del usuario
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error("Error al listar usuarios:", usersError.message);
    return;
  }

  const user = usersData.users.find(u => u.email === email);
  
  if (!user) {
    console.log(`❌ El usuario ${email} no existe todavía en Supabase Auth.`);
    console.log("👉 Por favor ingresa a http://localhost:3000/register y créalo primero.");
    return;
  }

  console.log(`✅ Usuario encontrado (ID: ${user.id}). Actualizando perfil a 'admin'...`);
  
  // 2. Hacerlo admin en perfiles
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id);

  if (updateError) {
    console.error("❌ Error al actualizar el rol:", updateError.message);
  } else {
    console.log("✅ Tu cuenta ahora es un Administrador.");
  }

  // 3. Crear una transacción pendiente de prueba (para que tengas algo que aprobar en la interfaz)
  console.log("Verificando si necesitas una transacción de prueba...");
  const { data: txs } = await supabase
    .from("transactions")
    .select("id")
    .eq("status", "pending")
    .limit(1);

  if (!txs || txs.length === 0) {
    console.log("Creando una transacción de prueba para ti...");
    const { error: insertTxError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id, // usando tu mismo ID como cliente para la prueba
        amount: 85.00,
        status: "pending",
        payment_method: "pending",
        notes: "Transacción de prueba generada automáticamente"
      });
      
      if (insertTxError) console.error("Error creando transacción:", insertTxError.message);
      else console.log("✅ Transacción de prueba insertada correctamente.");
  } else {
    console.log("✅ Ya existen transacciones pendientes en la base para probar.");
  }
  
  console.log("\n🎉 ¡Todo listo! Inicia sesión en http://localhost:3000/login y ve a /transacciones");
}

setupTestAccount();
