import { authClient } from '#/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/profile">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {session.user.name.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
            {session.user.name}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void authClient.signOut()
          }}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/sign-in">Sign in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link to="/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
