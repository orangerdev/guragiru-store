import type { UserRole } from '@/lib/auth/verify-admin'

export default function RoleGate({
  role,
  allowed,
  children,
}: {
  role: UserRole
  allowed: UserRole[]
  children: React.ReactNode
}) {
  if (!allowed.includes(role)) return null
  return <>{children}</>
}
