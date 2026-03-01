import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

/**
 * Admin dashboard layout with role-based access control
 * Only accessible by ADMIN and AGENT roles
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const metadata = sessionClaims?.metadata as { role?: string } | undefined
  const userRole = metadata?.role

  // Only ADMIN and AGENT can access admin routes
  if (userRole !== 'ADMIN' && userRole !== 'AGENT') {
    redirect('/forbidden')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={userRole} />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
