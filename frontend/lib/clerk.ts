import { auth, clerkClient } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'

/**
 * Get the current user's role from Clerk session claims
 * @returns The user's role (CUSTOMER, AGENT, or ADMIN) or null if not authenticated
 */
export async function getUserRole(): Promise<Role | null> {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as { role?: Role } | undefined
  return metadata?.role ?? null
}

/**
 * Require authentication and return the user's role
 * @throws Redirect to sign-in if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

/**
 * Require the user to have at least the specified role
 * @param requiredRole - Minimum role required (ADMIN requires ADMIN, AGENT requires AGENT or ADMIN)
 * @throws 403 Forbidden if user doesn't have required role
 */
export async function requireRole(requiredRole: Role) {
  await requireAuth()
  const userRole = await getUserRole()
  
  if (!userRole) {
    throw new Error('User role not found')
  }

  const roleHierarchy: Record<Role, number> = {
    CUSTOMER: 0,
    AGENT: 1,
    ADMIN: 2,
  }

  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return userRole
}

/**
 * Require the user to be an admin
 * @throws 403 Forbidden if user is not admin
 */
export async function requireAdmin() {
  return requireRole('ADMIN')
}

/**
 * Require the user to be an agent or admin
 * @throws 403 Forbidden if user is customer
 */
export async function requireAgentOrAdmin() {
  return requireRole('AGENT')
}
