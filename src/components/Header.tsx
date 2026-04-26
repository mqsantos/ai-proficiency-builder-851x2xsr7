import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-950/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-slate-300 hover:text-white" />
        <div className="relative hidden w-64 sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search skills, tech..."
            className="h-9 w-full rounded-md border-white/10 bg-slate-900/50 pl-9 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-primary/50"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
