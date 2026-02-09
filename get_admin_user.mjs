import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables. Make sure to run with --env-file=.env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function run() {
    const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('email, rol')
        .eq('rol', 'admin')

    if (error) {
        console.error('Error fetching users:', error)
        process.exit(1)
    }

    console.log('ADMIN_USERS_START')
    console.log(JSON.stringify(usuarios))
    console.log('ADMIN_USERS_END')
}

run()
