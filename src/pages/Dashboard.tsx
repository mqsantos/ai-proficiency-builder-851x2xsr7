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
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Activity, Trophy, Zap } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

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

  useRealtime('user_progress', () => {
    getUserProgress().then((p) => setProgress(p.filter((pr) => pr.user_id === user?.id)))
  })

  const chartData = useMemo(() => {
    if (!domains.length || !topics.length) return []
    return domains.map((d) => {
      const domainTopics = topics.filter((t) => t.domain_id === d.id)
      const total = domainTopics.length
      const mastered = progress.filter(
        (p) => p.status === 'mastered' && domainTopics.find((t) => t.id === p.topic_id),
      ).length
      return {
        domain: d.name.replace(' & ', '\n'), // break long names
        score: total > 0 ? Math.round((mastered / total) * 100) : 0,
        fullMark: 100,
      }
    })
  }, [domains, progress, topics])

  const recentMastered = progress
    .filter((p) => p.status === 'mastered')
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 5)
    .map((p) => {
      const topic = topics.find((t) => t.id === p.topic_id)
      const domain = domains.find((d) => d.id === topic?.domain_id)
      return { ...p, topic, domain }
    })

  const totalMastered = progress.filter((p) => p.status === 'mastered').length

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Progress</h1>
          <p className="text-slate-400 mt-1">Track your AI mastery journey.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Proficiency Radar
            </CardTitle>
            <CardDescription>Your mastery distribution across AI domains</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {chartData.length > 0 && (
              <ChartContainer
                config={{ score: { label: 'Mastery %', color: 'hsl(var(--primary))' } }}
                className="h-full w-full"
              >
                <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
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

        <div className="space-y-6">
          <Card className="glass-panel border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-[160px]">
              <Trophy className="h-10 w-10 text-amber-400 mb-3" />
              <div className="text-4xl font-black text-white">{totalMastered}</div>
              <p className="text-sm text-slate-400 mt-1 font-medium">Total Skills Mastered</p>
            </CardContent>
          </Card>

          <Card className="glass-panel flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" /> Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMastered.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No skills mastered yet. Time to start learning!
                  </p>
                ) : (
                  recentMastered.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.domain?.color || '#fff' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-200">{item.topic?.name}</p>
                        <p className="text-xs text-slate-500">{item.domain?.name}</p>
                      </div>
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
