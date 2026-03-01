import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

/**
 * Customer dashboard layout
 * Accessible by all authenticated users (CUSTOMER, AGENT, ADMIN)
 */
export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole="CUSTOMER" />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
