
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function run() {
  const client = createClient(supabaseUrl, adminKey);

  console.log("=== Querying DASHBOARD way ===");
  const { data: d1, error: e1 } = await client.from("subscriptions").select("id, auto_renew, services(type, price)").eq("status", "active");
  console.log("Dashboard count:", d1?.length, "Error:", e1);

  console.log("=== Querying ADMIN PAGE way ===");
  const { data: d2, error: e2 } = await client.from("subscriptions").select("id, user_id, created_at, starts_at, ends_at, status, auto_renew, services:services(id, type, name, price), profiles:profiles(id, first_name, last_name, email)");
  console.log("Admin count:", d2?.length, "Error:", e2);
  
  if (d1 && d1.length > 0) console.log("Dashboard item 0", d1[0]);
  if (d2 && d2.length > 0) console.log("Admin item 0", d2[0]);
}

run();

