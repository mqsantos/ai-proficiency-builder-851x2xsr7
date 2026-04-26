import { useEffect, useState, useMemo } from 'react'
import {
  getDomains,
  getUserProgress,
  getAllTopics,
  Domain,
  UserProgress,
  Topic,
} from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts'
import {
  Activity,
  Trophy,
  Zap,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Github,
  Play,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { getUserProjects, UserProject, Project } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DomainForm } from '@/components/forms/DomainForm'
import { createDomain, updateDomain, deleteDomain } from '@/services/api'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useAuth()
  const [domains, setDomains] = useState<Domain[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [userProjects, setUserProjects] = useState<UserProject[]>([])

  const loadData = async () => {
    if (!user) return
    const [d, p, t, uProjs] = await Promise.all([
      getDomains(),
      getUserProgress(),
      getAllTopics(),
      getUserProjects(user.id),
    ])
    setDomains(d)
    setProgress(p.filter((pr) => pr.user_id === user.id))
    setTopics(t)
    setUserProjects(uProjs)
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('user_progress', () => loadData())
  useRealtime('domains', () => loadData())

  const handleCreateDomain = async (data: any) => {
    try {
      await createDomain(data)
      toast.success('Domain created')
    } catch (e) {
      toast.error('Failed to create domain')
    }
  }

  const handleUpdateDomain = async (id: string, data: any) => {
    try {
      await updateDomain(id, data)
      toast.success('Domain updated')
    } catch (e) {
      toast.error('Failed to update domain')
    }
  }

  const handleDeleteDomain = async (id: string) => {
    try {
      await deleteDomain(id)
      toast.success('Domain deleted')
    } catch (e: any) {
      toast.error(`Failed to delete domain: ${getErrorMessage(e)}`)
    }
  }

  const getScoreWeight = (status: string) => {
    switch (status) {
      case 'Learning':
        return 1
      case 'Familiar':
        return 2
      case 'Expert':
        return 3
      case 'Mentor of Others':
        return 4
      default:
        return 0
    }
  }

  const chartData = useMemo(() => {
    if (!domains.length || !topics.length) return []
    return domains.map((d) => {
      const domainTopics = topics.filter((t) => t.domain_id === d.id)
      const totalMaxScore = domainTopics.length * 4

      const currentScore = progress
        .filter((p) => domainTopics.find((t) => t.id === p.topic_id))
        .reduce((sum, p) => sum + getScoreWeight(p.status), 0)

      return {
        domain: d.name.replace(' & ', '\n'), // break long names
        score: totalMaxScore > 0 ? Math.round((currentScore / totalMaxScore) * 100) : 0,
        fullMark: 100,
      }
    })
  }, [domains, progress, topics])

  const highLevelProgress = progress
    .filter((p) => p.status === 'Expert' || p.status === 'Mentor of Others')
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 5)
    .map((p) => {
      const topic = topics.find((t) => t.id === p.topic_id)
      const domain = domains.find((d) => d.id === topic?.domain_id)
      return { ...p, topic, domain }
    })

  const totalExperts = progress.filter((p) => p.status === 'Expert').length
  const totalMentors = progress.filter((p) => p.status === 'Mentor of Others').length

  const completedProjects = userProjects.filter(
    (up) => up.status === 'Completed' && up.expand?.project_id,
  )
  const evidenceItems = progress.filter((p) => p.evidence_url && p.evidence_url.length > 0)

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your AI mastery journey with granular details.
          </p>
        </div>
        <DomainForm onSubmit={handleCreateDomain}>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Domain
          </Button>
        </DomainForm>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Proficiency Radar
              </CardTitle>
              <CardDescription>Your aggregated mastery score across domains</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {chartData.length > 0 && (
                <ChartContainer
                  config={{ score: { label: 'Mastery %', color: 'hsl(var(--primary))' } }}
                  className="h-full w-full"
                >
                  <RadarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                  >
                    <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                    <PolarAngleAxis
                      dataKey="domain"
                      tick={{ fill: 'hsl(var(--foreground))', fillOpacity: 0.7, fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Manage Domains</span>
                <Badge variant="outline">{domains.length} / 8 Phases</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {domains.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card flex-wrap gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="font-medium text-sm sm:text-base truncate max-w-[200px]">
                      {d.name}
                    </span>
                    {d.level && (
                      <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                        {d.level}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <DomainForm initialData={d} onSubmit={(data) => handleUpdateDomain(d.id, data)}>
                      <Button size="icon" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DomainForm>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the domain
                            and all associated topics, projects, and progress.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDomain(d.id)}
                            className="bg-red-500 hover:text-white hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-panel border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-[120px]">
                <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                <div className="text-3xl font-black text-foreground">{totalExperts}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Expert Skills</p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-purple-500/20 bg-purple-500/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-[120px]">
                <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
                <div className="text-3xl font-black text-foreground">{totalMentors}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Mentor Level</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-lg flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" /> Recent High Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highLevelProgress.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Reach Expert or Mentor level to see achievements here!
                  </p>
                ) : (
                  highLevelProgress.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.domain?.color || '#fff' }}
                        />
                        <div className="truncate">
                          <p
                            className="text-sm font-medium text-foreground truncate max-w-[120px]"
                            title={item.topic?.name}
                          >
                            {item.topic?.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.domain?.name}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'Mentor of Others'
                            ? 'border-purple-500/30 text-purple-500 bg-purple-500/10 text-[10px] px-1.5 shadow-none'
                            : 'text-[10px] px-1.5 shadow-none'
                        }
                      >
                        {item.status === 'Mentor of Others' ? 'Mentor' : 'Expert'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-xl">Evidence Portfolio</CardTitle>
            <CardDescription>Topics where you've added evidence of mastery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {evidenceItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No evidence added yet.</p>
            ) : (
              evidenceItems.map((item) => {
                const t = topics.find((topic) => topic.id === item.topic_id)
                return (
                  <div key={item.id} className="p-4 rounded-lg bg-secondary/30 border">
                    <h5 className="font-semibold text-sm mb-1">{t?.name}</h5>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mb-3">{item.notes}</p>
                    )}
                    <a
                      href={item.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" /> View Evidence
                    </a>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-xl">Completed Projects</CardTitle>
            <CardDescription>Recommended projects you've finished.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects completed yet.</p>
            ) : (
              completedProjects.map((item) => {
                const p = item.expand?.project_id
                if (!p) return null
                return (
                  <div key={item.id} className="p-4 rounded-lg bg-secondary/30 border">
                    <h5 className="font-semibold text-sm mb-1">{p.title}</h5>
                    <div className="flex gap-4 mt-2">
                      {item.repo_url && (
                        <a
                          href={item.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs hover:text-primary transition-colors"
                        >
                          <Github className="h-3 w-3 mr-1" /> Source Code
                        </a>
                      )}
                      {item.demo_url && (
                        <a
                          href={item.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs hover:text-primary transition-colors"
                        >
                          <Play className="h-3 w-3 mr-1" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
