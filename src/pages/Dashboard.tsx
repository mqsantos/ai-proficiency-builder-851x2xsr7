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
import { Activity, Trophy, Zap, Sparkles, Plus, Edit2, Trash2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
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

  const loadData = async () => {
    const [d, p, t] = await Promise.all([getDomains(), getUserProgress(), getAllTopics()])
    setDomains(d)
    setProgress(p.filter((pr) => pr.user_id === user?.id))
    setTopics(t)
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
    if (!confirm('Delete domain and all related topics/resources?')) return
    try {
      await deleteDomain(id)
      toast.success('Domain deleted')
    } catch (e) {
      toast.error('Failed to delete domain')
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
              <CardTitle>Manage Domains</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {domains.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full" style={{ background: d.color }} />
                    <span className="font-medium">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DomainForm initialData={d} onSubmit={(data) => handleUpdateDomain(d.id, data)}>
                      <Button size="icon" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DomainForm>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteDomain(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
    </div>
  )
}
