'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { Role } from '@prisma/client'

/**
 * Header component with user information and actions
 * Displays current user and provides logout functionality
 */
export function Header() {
  const { user } = useUser()

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground">
            Lumina
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.emailAddresses[0]?.emailAddress}
              </span>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                    userButtonPopoverCard: 'bg-card border border-border',
                    userButtonPopoverActionButton: 'text-foreground hover:bg-accent',
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
