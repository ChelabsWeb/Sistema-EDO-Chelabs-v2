import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function run() {
    const email = 'admin@chelabs.com'
    const newPassword = '123456'

    console.log(`Buscando usuario: ${email}...`)

    // First find the user in auth.users by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        process.exit(1)
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.error(`Usuario no encontrado en Supabase Auth: ${email}`)
        process.exit(1)
    }

    console.log(`Usuario encontrado (ID: ${user.id}). Cambiando contraseña...`)

    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    )

    if (error) {
        console.error('Error al cambiar contraseña:', error)
        process.exit(1)
    }

    console.log('✅ Contraseña cambiada con éxito.')
}

run()
