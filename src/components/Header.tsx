import { Bell, Search, Flame, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useState, useEffect } from 'react'

export function Header() {
  const { user } = useAuth()
  const [xp, setXp] = useState(user?.xp || 0)
  const [streak, setStreak] = useState(user?.streak_count || 0)

  useEffect(() => {
    if (user) {
      setXp(user.xp || 0)
      setStreak(user.streak_count || 0)
    }
  }, [user])

  useRealtime('users', (e) => {
    if (e.record.id === user?.id) {
      setXp(e.record.xp || 0)
      setStreak(e.record.streak_count || 0)
    }
  })

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="relative hidden w-64 sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search skills, tech..."
            className="h-9 w-full rounded-md border-border/50 bg-muted/50 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <div className="flex items-center gap-3 mr-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
            <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-sm">
              <Flame className="h-4 w-4" />
              <span>{streak}</span>
            </div>
            <div className="w-px h-4 bg-border/50" />
            <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
              <Star className="h-4 w-4" />
              <span>{xp} XP</span>
            </div>
          </div>
        )}
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
