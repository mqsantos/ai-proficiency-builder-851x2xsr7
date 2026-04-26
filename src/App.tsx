import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ThemeProvider } from '@/components/ThemeProvider'

import Layout from './components/Layout'
import Login from './pages/Login'
import Index from './pages/Index'
import DomainDetail from './pages/DomainDetail'
import Dashboard from './pages/Dashboard'
import ResourceLibrary from './pages/ResourceLibrary'
import FindMentors from './pages/FindMentors'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/domain/:slug" element={<DomainDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resources" element={<ResourceLibrary />} />
              <Route path="/mentors" element={<FindMentors />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
