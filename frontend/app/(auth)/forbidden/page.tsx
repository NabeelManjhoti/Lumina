import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * 403 Forbidden page - displayed when user lacks permissions
 */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-bold text-primary">403</h1>
        <h2 className="text-2xl font-semibold text-foreground">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/">
            <Button variant="outline">
              Go Home
            </Button>
          </Link>
          <Link href="/customer/chat">
            <Button>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
