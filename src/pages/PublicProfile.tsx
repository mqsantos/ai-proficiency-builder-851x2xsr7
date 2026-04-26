import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  User,
  Domain,
  Topic,
  UserProgress,
  UserProject,
  Project,
  getUserBySlug,
  getDomains,
  getAllTopics,
  getUserProgress,
  getUserProjects,
} from '@/services/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User as UserIcon, Flame, Star, Github, Play, ArrowLeft, Code2 } from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<User | null>(null)
  const [domains, setDomains] = useState<Domain[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [progresses, setProgresses] = useState<UserProgress[]>([])
  const [userProjects, setUserProjects] = useState<UserProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      try {
        const user = await getUserBySlug(slug)
        setProfile(user)
        const [d, t, up, upj] = await Promise.all([
          getDomains(),
          getAllTopics(),
          getUserProgress(user.id),
          getUserProjects(user.id),
        ])
        setDomains(d)
        setTopics(t)
        setProgresses(up)
        setUserProjects(upj)
      } catch (e) {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [slug])

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (error || !profile)
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This profile doesn't exist or is set to private.
        </p>
        <Link to="/" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    )

  const radarData = domains.map((d) => {
    const domainTopics = topics.filter((t) => t.domain_id === d.id)
    const userProgresses = progresses.filter((p) => domainTopics.some((t) => t.id === p.topic_id))
    const scoreMap: Record<string, number> = {
      None: 0,
      Learning: 1,
      Familiar: 2,
      Expert: 3,
      'Mentor of Others': 4,
    }
    let totalScore = 0
    userProgresses.forEach((p) => {
      totalScore += scoreMap[p.status] || 0
    })
    const maxPossible = domainTopics.length > 0 ? domainTopics.length * 4 : 1
    const percentage = Math.round((totalScore / maxPossible) * 100)
    return { domain: d.name, score: percentage, fullMark: 100 }
  })

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="container max-w-6xl py-8 space-y-8 animate-fade-in">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
        </Link>

        {/* Profile Header */}
        <Card className="border-white/10 bg-slate-950/50 backdrop-blur-xl overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20" />
          <CardContent className="pt-0 relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
              <Avatar className="w-24 h-24 border-4 border-slate-950 shadow-xl rounded-xl">
                <AvatarImage
                  src={
                    profile.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email || profile.id}`
                  }
                />
                <AvatarFallback className="rounded-xl bg-primary/20">
                  <UserIcon className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl font-bold">{profile.name || 'Explorer'}</h1>
                {profile.headline && <p className="text-primary font-medium">{profile.headline}</p>}
                <p className="text-muted-foreground text-sm max-w-2xl">
                  {profile.bio || 'No bio provided yet.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{profile.xp || 0} XP</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">{profile.streak_count || 0} Day Streak</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <Card className="border-white/10 bg-slate-950/50 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Proficiency Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[250px] w-full" config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarData}
                      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <PolarGrid stroke="rgba(255,255,255,0.2)" />
                      <PolarAngleAxis
                        dataKey="domain"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Proficiency"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: 'rgba(255,255,255,0.1)',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent h-auto p-0 space-x-6">
                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2"
                >
                  Skills & Tech
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2"
                >
                  Portfolio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-6 space-y-6">
                {domains.map((domain) => {
                  const domainTopics = topics.filter((t) => t.domain_id === domain.id)
                  const userProgs = progresses.filter((p) =>
                    domainTopics.some((t) => t.id === p.topic_id),
                  )
                  if (userProgs.length === 0) return null

                  return (
                    <div key={domain.id} className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: domain.color }}
                        />
                        {domain.name}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {userProgs.map((progress) => {
                          const topic = domainTopics.find((t) => t.id === progress.topic_id)
                          if (!topic) return null
                          return (
                            <Card
                              key={progress.id}
                              className="border-white/10 bg-slate-950/50 backdrop-blur-sm overflow-hidden border-primary/20"
                            >
                              <CardHeader className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] uppercase tracking-wider mb-1"
                                    >
                                      {topic.type}
                                    </Badge>
                                    <CardTitle className="text-base">{topic.name}</CardTitle>
                                  </div>
                                  <Badge
                                    className={cn(
                                      progress.status === 'Expert' ||
                                        progress.status === 'Mentor of Others'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary',
                                    )}
                                  >
                                    {progress.status}
                                  </Badge>
                                </div>
                              </CardHeader>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {progresses.length === 0 && (
                  <div className="text-center py-12 border border-white/10 border-dashed rounded-xl bg-white/5">
                    <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No skills mapped yet</h3>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6 space-y-6">
                {userProjects.length === 0 ? (
                  <div className="text-center py-12 border border-white/10 border-dashed rounded-xl bg-white/5">
                    <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">Portfolio is empty</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userProjects.map((up) => {
                      const project = up.expand?.project_id as unknown as Project
                      if (!project) return null
                      const domain = project.expand?.domain_id as unknown as Domain

                      return (
                        <Card
                          key={up.id}
                          className="border-white/10 bg-slate-950/50 backdrop-blur-sm flex flex-col"
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p
                                  className="text-xs text-muted-foreground mb-1"
                                  style={{ color: domain?.color }}
                                >
                                  {domain?.name}
                                </p>
                                <CardTitle className="text-lg">{project.title}</CardTitle>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  up.status === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : up.status === 'In Progress'
                                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                      : '',
                                )}
                              >
                                {up.status}
                              </Badge>
                            </div>
                            {project.description && (
                              <CardDescription className="line-clamp-2 mt-2 text-xs">
                                {project.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="mt-auto p-4 pt-2">
                            {(up.repo_url || up.demo_url) && (
                              <div className="flex gap-4 mt-2 text-sm bg-black/20 p-2 rounded-md border border-white/5">
                                {up.repo_url && (
                                  <a
                                    href={up.repo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center text-muted-foreground hover:text-white transition-colors"
                                  >
                                    <Github className="w-4 h-4 mr-1.5" /> Code
                                  </a>
                                )}
                                {up.demo_url && (
                                  <a
                                    href={up.demo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center text-muted-foreground hover:text-white transition-colors"
                                  >
                                    <Play className="w-4 h-4 mr-1.5" /> Demo
                                  </a>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
