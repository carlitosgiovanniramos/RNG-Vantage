import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyMigration() {
  console.log('--- Verificando conexión con Supabase ---')
  
  // 1. Verificar tabla services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .limit(5)

  if (servicesError) {
    console.error('❌ Error al acceder a la tabla "services":', servicesError.message)
  } else {
    console.log('✅ Tabla "services" detectada.')
    console.log(`📊 Registros encontrados: ${services?.length || 0}`)
    if (services && services.length > 0) {
      console.log('📝 Ejemplo de dato:', services[0].name)
    }
  }

  // 2. Verificar tabla profiles (aunque este vacia, el esquema debe existir)
  const { error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (profilesError) {
    if (profilesError.code === '42P01') {
      console.error('❌ La tabla "profiles" NO existe.')
    } else {
      console.error('ℹ️ Tabla "profiles" detectada (pero hubo un error de acceso, posiblemente RLS):', profilesError.message)
    }
  } else {
    console.log('✅ Tabla "profiles" detectada.')
  }

  // 3. Verificar tabla reservations
  const { error: resError } = await supabase
    .from('reservations')
    .select('*')
    .limit(1)

  if (resError) {
    console.error('ℹ️ Tabla "reservations" detectada (o error de RLS):', resError.message)
  } else {
    console.log('✅ Tabla "reservations" detectada.')
  }
}

verifyMigration()
