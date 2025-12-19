import { redirect } from 'next/navigation'

// Redirect /login to /auth/login for convenience
export default function LoginRedirect() {
  redirect('/auth/login')
}
