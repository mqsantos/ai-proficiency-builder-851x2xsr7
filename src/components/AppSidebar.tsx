import { Link, useLocation } from 'react-router-dom'
import { Network, LineChart, Library, Users, LogOut, User } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  const navItems = [
    { title: 'Profile', url: '/profile', icon: User },
    { title: 'Roadmap', url: '/', icon: Network },
    { title: 'Dashboard', url: '/dashboard', icon: LineChart },
    { title: 'Resource Library', url: '/resources', icon: Library },
    { title: 'Find Mentors', url: '/mentors', icon: Users },
  ]

  return (
    <Sidebar variant="inset" className="border-r border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
            <Network className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">AI Proficiency</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="hover:bg-white/5 hover:text-white"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto w-full justify-start gap-3 p-2 hover:bg-white/5">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                />
                <AvatarFallback className="rounded-md bg-primary/20">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium text-white">{user?.name || 'Explorer'}</span>
                <span className="text-xs text-slate-400">{user?.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
