'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Role } from '@prisma/client'
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Upload,
  Settings
} from 'lucide-react'

interface SidebarProps {
  userRole: Role
}

/**
 * Sidebar component with role-based navigation
 * Shows different menu items based on user role
 */
export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const isAdmin = userRole === 'ADMIN' || userRole === 'AGENT'

  const customerLinks = [
    { href: '/customer/chat', label: 'Chat', icon: MessageSquare },
  ]

  const adminLinks = [
    { href: '/admin/documents', label: 'Documents', icon: FileText },
    { href: '/admin/upload', label: 'Upload', icon: Upload },
  ]

  const links = isAdmin ? adminLinks : customerLinks

  return (
    <aside className="w-64 border-r border-border bg-card min-h-screen">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              Lumina
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname?.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  )
}
