import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Homepage - redirects to dashboard if authenticated,
 * shows welcome page with sign-in/sign-up options for guests
 */
export default async function HomePage() {
  const { userId } = await auth()

  if (userId) {
    // Redirect authenticated users to their dashboard
    redirect('/customer/chat')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Lumina
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Customer Support Chatbot
          </p>
          <p className="text-muted-foreground">
            Get instant answers from our knowledge base powered by advanced AI
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-8">
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold mb-2">Instant Answers</h3>
            <p className="text-sm text-muted-foreground">
              Get accurate responses to your questions in seconds
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-semibold mb-2">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">
              Access to comprehensive documentation and resources
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">Secure Access</h3>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade security for your data
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/sign-in">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
