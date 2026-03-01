import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/reset-password(.*)',
])

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/documents(.*)',
  '/api/upload(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  const { userId, sessionClaims } = await auth()

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Check role-based access for admin routes
  if (isAdminRoute(req)) {
    const metadata = sessionClaims?.metadata as { role?: string } | undefined
    const userRole = metadata?.role

    if (userRole !== 'ADMIN' && userRole !== 'AGENT') {
      return NextResponse.redirect(new URL('/forbidden', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
