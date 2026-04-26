import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  User,
  Domain,
  Topic,
  UserProgress,
  UserProject,
  Project,
  getDomains,
  getAllTopics,
  getUserProgress,
  getUserProjects,
  getAllProjects,
  updateUserProfile,
  upsertProgress,
  deleteUserProgress,
  upsertUserProject,
  deleteUserProject,
} from '@/services/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/forms/ProfileForm'
import { AddPortfolioProjectForm } from '@/components/forms/AddPortfolioProjectForm'
import { ProgressForm } from '@/components/forms/ProgressForm'
import { UserProjectForm } from '@/components/forms/UserProjectForm'
import { User as UserIcon, Flame, Star, Code2, Trash2, Github, Play } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [domains, setDomains] = useState<Domain[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [progresses, setProgresses] = useState<UserProgress[]>([])
  const [userProjects, setUserProjects] = useState<UserProject[]>([])

  const [domainFilter, setDomainFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const [d, t, p, up, upj] = await Promise.all([
        getDomains(),
        getAllTopics(),
        getAllProjects(),
        getUserProgress(user.id),
        getUserProjects(user.id),
      ])
      setDomains(d)
      setTopics(t)
      setProjects(p)
      setProgresses(up.filter((u) => u.user_id === user.id))
      setUserProjects(upj)
      if (!profile) setProfile(user as User)
    } catch (error) {
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime(
    'users',
    (e) => {
      if (e.action === 'update' && e.record.id === user?.id) {
        setProfile(e.record as User)
      }
    },
    !!user,
  )
  useRealtime(
    'user_progress',
    () => {
      loadData()
    },
    !!user,
  )
  useRealtime(
    'user_projects',
    () => {
      loadData()
    },
    !!user,
  )

  if (!user || !profile || isLoading) return null

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateUserProfile(user.id, data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Failed to update profile')
    }
  }

  const handleAddProject = async (data: any) => {
    try {
      const { project_id, ...rest } = data
      await upsertUserProject(user.id, project_id, rest)
      toast.success('Project added to portfolio')
    } catch (err) {
      toast.error('Failed to add project')
    }
  }

  const handleUpdateUserProject = async (projectId: string, data: any) => {
    try {
      await upsertUserProject(user.id, projectId, data)
      toast.success('Project updated')
    } catch (err) {
      toast.error('Failed to update project')
    }
  }

  const handleRemoveProject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this project?')) return
    try {
      await deleteUserProject(id)
      toast.success('Project removed')
    } catch (err) {
      toast.error('Failed to remove project')
    }
  }

  const handleUpdateProgress = async (topicId: string, data: any) => {
    try {
      await upsertProgress(user.id, topicId, data)
      toast.success('Progress updated')
    } catch (err) {
      toast.error('Failed to update progress')
    }
  }

  const handleResetProgress = async (id: string) => {
    if (!confirm('Are you sure you want to reset progress for this skill?')) return
    try {
      await deleteUserProgress(id)
      toast.success('Progress reset')
    } catch (err) {
      toast.error('Failed to reset progress')
    }
  }

  const filteredTopics = topics.filter(
    (t) =>
      (domainFilter === 'all' || t.domain_id === domainFilter) &&
      (typeFilter === 'all' || t.type === typeFilter),
  )

  const unaddedProjects = projects.filter((p) => !userProjects.some((up) => up.project_id === p.id))

  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-fade-in">
      <Card className="border-white/10 bg-slate-950/50 backdrop-blur-xl overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20" />
        <CardContent className="pt-0 relative px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
            <Avatar className="w-24 h-24 border-4 border-slate-950 shadow-xl rounded-xl">
              <AvatarImage
                src={
                  profile.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`
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
              <ProfileForm user={profile} onSubmit={handleUpdateProfile}>
                <Button variant="outline" className="shrink-0">
                  Edit Profile
                </Button>
              </ProfileForm>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <Select value={domainFilter} onValueChange={setDomainFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="skill">Skills</SelectItem>
                    <SelectItem value="tech">Technologies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 border border-white/10 border-dashed rounded-xl bg-white/5">
              <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No skills found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {domains
                .filter((d) => domainFilter === 'all' || d.id === domainFilter)
                .map((domain) => {
                  const domainTopics = filteredTopics.filter((t) => t.domain_id === domain.id)
                  if (domainTopics.length === 0) return null
                  return (
                    <div key={domain.id} className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: domain.color }}
                        />
                        {domain.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {domainTopics.map((topic) => {
                          const progress = progresses.find((p) => p.topic_id === topic.id)
                          return (
                            <Card
                              key={topic.id}
                              className={cn(
                                'border-white/10 bg-slate-950/50 backdrop-blur-sm overflow-hidden',
                                progress ? 'border-primary/30' : '',
                              )}
                            >
                              <CardHeader className="pb-3 px-4 pt-4">
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
                                  {progress ? (
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
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Not Started
                                    </Badge>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="px-4 pb-4 pt-0">
                                <div className="flex gap-2 justify-end mt-4">
                                  {progress ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleResetProgress(progress.id)}
                                      >
                                        Reset
                                      </Button>
                                      <ProgressForm
                                        initialData={progress}
                                        topicName={topic.name}
                                        onSubmit={(d) => handleUpdateProgress(topic.id, d)}
                                      >
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          className="text-xs h-8"
                                        >
                                          Update
                                        </Button>
                                      </ProgressForm>
                                    </>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-8 border-primary/50 hover:bg-primary/10"
                                      onClick={() =>
                                        handleUpdateProgress(topic.id, { status: 'Learning' })
                                      }
                                    >
                                      Start Learning
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">My Projects</h2>
            <AddPortfolioProjectForm projects={unaddedProjects} onSubmit={handleAddProject}>
              <Button disabled={unaddedProjects.length === 0}>Add Project to Portfolio</Button>
            </AddPortfolioProjectForm>
          </div>

          {userProjects.length === 0 ? (
            <div className="text-center py-12 border border-white/10 border-dashed rounded-xl bg-white/5">
              <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Portfolio is empty</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Add your first project to start tracking your work.
              </p>
              <AddPortfolioProjectForm projects={unaddedProjects} onSubmit={handleAddProject}>
                <Button variant="outline" disabled={unaddedProjects.length === 0}>
                  Add Project
                </Button>
              </AddPortfolioProjectForm>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProjects.map((up) => {
                const project = up.expand?.project_id as unknown as Project
                if (!project) return null
                const domain = project.expand?.domain_id as unknown as Domain

                return (
                  <Card
                    key={up.id}
                    className="border-white/10 bg-slate-950/50 backdrop-blur-sm flex flex-col"
                  >
                    <CardHeader className="pb-3">
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
                        <CardDescription className="line-clamp-2 mt-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      {(up.repo_url || up.demo_url) && (
                        <div className="flex gap-4 mb-4 text-sm bg-black/20 p-3 rounded-md border border-white/5">
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleRemoveProject(up.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                        </Button>
                        <UserProjectForm
                          initialData={up}
                          project={project}
                          onSubmit={(d) => handleUpdateUserProject(project.id, d)}
                        >
                          <Button variant="secondary" size="sm" className="text-xs h-8">
                            Update Status
                          </Button>
                        </UserProjectForm>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
