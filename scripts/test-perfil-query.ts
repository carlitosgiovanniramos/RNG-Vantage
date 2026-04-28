
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function run() {
  const client = createClient(supabaseUrl, adminKey);

  const { data: subs, error } = await client
    .from("subscriptions")
    .select("id, user_id, status, starts_at, ends_at, auto_renew, services(id, name, type, price)");
  
  console.log("Perfil query count:", subs?.length, "Error:", error);
  if (subs?.length > 0) {
    console.log("First sub user_id:", subs[0].user_id);
    console.log("Auth users:", subs.map(s => s.user_id));
  }
}

run();

