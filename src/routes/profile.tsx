import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Separator } from '#/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { getRequest } from '@tanstack/react-start/server'

const upgradeToOrganizer = createServerFn({ method: 'POST' }).handler(
  async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      throw new Error('Not authenticated')
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.role === 'ORGANIZER') {
      throw new Error('Already an organizer')
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'ORGANIZER' },
    })

    console.log(`User upgraded to ORGANIZER userId=${session.user.id}`)

    return { success: true }
  },
)

const getUserProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      balance: true,
      createdAt: true,
    },
  })

  if (!user) return null

  return user
})

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
  loader: () => getUserProfile(),
})

function ProfilePage() {
  const profile = Route.useLoaderData()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [upgrading, setUpgrading] = useState(false)
  const [upgraded, setUpgraded] = useState(false)

  if (!profile && !session) {
    void navigate({ to: '/sign-in' })
    return null
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const role = upgraded ? 'ORGANIZER' : profile.role

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      await upgradeToOrganizer()
      setUpgraded(true)
    } catch (err) {
      console.error('Upgrade failed', err)
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="font-medium">{profile.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant={role === 'ORGANIZER' ? 'default' : 'secondary'}>
                {role}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className="text-lg font-semibold">
                ${(profile.balance / 100).toFixed(2)}
              </span>
            </div>
          </div>
          {role === 'CONSUMER' && (
            <>
              <Separator />
              <Button onClick={handleUpgrade} disabled={upgrading}>
                {upgrading ? 'Upgrading...' : 'Upgrade to Organizer'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
