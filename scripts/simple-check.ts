import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uzsasdbcewymviuelcsi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6c2FzZGJjZXd5bXZpdWVsY3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNDExOTIsImV4cCI6MjA1ODYwMTE5Mn0.8-oEIsL_uMab1_LN5aUinMVRismSZOYa4UkBgQ_qMab1_LN'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  console.log('--- START CHECK ---')
  
  const { data: s, error: se } = await supabase.from('services').select('name').limit(1)
  console.log('Services Table:', se ? 'ERROR: ' + se.message : 'OK (' + s[0]?.name + ')')

  const { error: pe } = await supabase.from('profiles').select('id').limit(1)
  console.log('Profiles Table:', pe ? 'EXISTS (Error: ' + pe.message + ')' : 'OK / EMPTY')

  const { error: re } = await supabase.from('reservations').select('id').limit(1)
  console.log('Reservations Table:', re ? 'EXISTS (Error: ' + re.message + ')' : 'OK / EMPTY')
  
  console.log('--- END CHECK ---')
}

check()
