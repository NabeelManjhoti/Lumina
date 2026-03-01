import { SignIn } from '@clerk/nextjs'

/**
 * Sign-in page using Clerk's pre-built component
 * Handles email/password authentication and password reset
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-card border border-border shadow-lg',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButtonText: 'text-foreground',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'bg-background border-border text-foreground',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            footerActionLink: 'text-primary hover:underline',
          },
        }}
      />
    </div>
  )
}
