import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getDomainBySlug,
  getTopicsByDomain,
  getUserProgress,
  upsertProgress,
  getResourcesByTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  Domain,
  Topic,
  UserProgress,
  Resource,
} from '@/services/api'
import { getIcon } from '@/components/Icons'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Layers, Cpu, Plus } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { TopicItem } from '@/components/TopicItem'
import { TopicForm } from '@/components/forms/TopicForm'

export default function DomainDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [domain, setDomain] = useState<Domain | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [progress, setProgress] = useState<Record<string, UserProgress>>({})
  const [resources, setResources] = useState<Record<string, Resource[]>>({})
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!slug) return
    try {
      const d = await getDomainBySlug(slug)
      setDomain(d)

      const [tData, pData] = await Promise.all([getTopicsByDomain(d.id), getUserProgress()])
      setTopics(tData)

      const progMap: Record<string, UserProgress> = {}
      pData.forEach((p) => {
        if (p.user_id === user?.id) progMap[p.topic_id] = p
      })
      setProgress(progMap)

      loadResources(tData)
    } catch (e) {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const loadResources = async (tData: Topic[]) => {
    const resMap: Record<string, Resource[]> = {}
    await Promise.all(tData.map(async t => {
      resMap[t.id] = await getResourcesByTopic(t.id)
    }))
    setResources(resMap)
  }

  useEffect(() => {
    loadData()
  }, [slug, user])

  useRealtime('user_progress', (e) => {
    if (e.record.user_id === user?.id) {
      setProgress((prev) => ({ ...prev, [e.record.topic_id]: e.record as UserProgress }))
    }
  })

  useRealtime('resources', () => {
    if (topics.length > 0) loadResources(topics)
  })

  const handleUpdateProgress = async (topicId: string, data: any) => {
    if (!user) return
    try {
      await upsertProgress(user.id, topicId, data)
      if (data.status === 'Mentor of Others') {
        toast.success('Incredible! You are now a Mentor!', {
          style: { background: domain?.color, color: '#fff', border: 'none' },
        })
      } else {
        toast.success('Progress updated')
      }
    } catch (err) {
      toast.error('Failed to update progress')
    }
  }

  const handleCreateTopic = async (data: any) => {
    if (!domain) return
    try {
      await createTopic({ ...data, domain_id: domain.id })
      toast.success('Topic created')
      loadData()
    } catch (e) { toast.error('Failed to create topic') }
  }

  const handleUpdateTopic = async (id: string, data: any) => {
    try {
      await updateTopic(id, data)
      toast.success('Topic updated')
      loadData()
    } catch (e) { toast.error('Failed to update topic') }
  }

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Delete topic?')) return
    try {
      await deleteTopic(id)
      toast.success('Topic deleted')
      loadData()
    } catch (e) { toast.error('Failed to delete topic') }
  }

  if (loading || !domain) return <div className="animate-pulse h-64 bg-muted rounded-xl m-8" />

  const skills = topics.filter((t) => t.type === 'skill')
  const techs = topics.filter((t) => t.type === 'tech')

  const renderTopicCard = (topic: Topic) => (
    <TopicItem
      key={topic.id}
      topic={topic}
      domainColor={domain.color}
      status={progress[topic.id]?.status || 'None'}
      progressRecord={progress[topic.id]}
      resources={resources[topic.id] || []}
      onUpdateProgress={(data) => handleUpdateProgress(topic.id, data)}
      onUpdateTopic={handleUpdateTopic}
      onDeleteTopic={handleDeleteTopic}
      onRefreshResources={() => loadResources(topics)}
    />
  )
    switch (status) {
      case 'Mentor of Others':
        return <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
      case 'Expert':
        return <CheckCircle2 className="h-5 w-5" style={{ color }} />
      case 'Familiar':
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case 'Learning':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'None':
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string = 'None', color?: string) => {
    switch (status) {
      case 'Mentor of Others':
        return (
          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
            Mentor
          </Badge>
        )
      case 'Expert':
        return (
          <Badge variant="default" style={{ backgroundColor: color }}>
            Expert
          </Badge>
        )
      case 'Familiar':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-none"
          >
            Familiar
          </Badge>
        )
      case 'Learning':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none"
          >
            Learning
          </Badge>
        )
      case 'None':
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground bg-background shadow-none">
            None
          </Badge>
        )
    }
  }

  const renderTopicCard = (topic: Topic) => {
    const status = progress[topic.id] || 'None'
    const isHighLevel = status === 'Expert' || status === 'Mentor of Others'
    return (
      <div
        key={topic.id}
        className={cn(
          'glass-panel p-4 rounded-xl flex items-center justify-between transition-colors',
          isHighLevel ? 'bg-secondary/80 border-border/80' : '',
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'font-medium',
                topic.type === 'tech' && 'font-mono text-sm',
                isHighLevel ? 'text-foreground' : 'text-foreground/90',
              )}
            >
              {topic.name}
            </h4>
            {getStatusBadge(status, domain.color)}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => handleLearnMore(topic.name)}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" /> Learn More
            </button>
            {status === 'Mentor of Others' && (
              <button
                onClick={() => handleShare(topic.name)}
                className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
              >
                <Share2 className="h-3 w-3" /> Share Achievement
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => handleToggleStatus(topic.id, status)}
          className="p-2 rounded-full hover:bg-secondary transition-colors shrink-0"
        >
          {getStatusIcon(status, domain.color)}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 text-muted-foreground hover:text-foreground -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roadmap
      </Button>

      <div
        className="glass-panel rounded-2xl p-8 mb-10 border-t-4"
        style={{ borderTopColor: domain.color }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-secondary" style={{ color: domain.color }}>
            {getIcon(domain.icon, { className: 'h-8 w-8' })}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{domain.name}</h1>
            <p className="text-muted-foreground mt-1">{domain.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Topics</h2>
        <TopicForm onSubmit={handleCreateTopic}>
          <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Topic</Button>
        </TopicForm>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" /> Core Skills
          </h2>
          <div className="space-y-3">{skills.map(renderTopicCard)}</div>
          {skills.length === 0 && <p className="text-sm text-muted-foreground">No core skills added.</p>}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5 text-muted-foreground" /> Technologies & Tools
          </h2>
          <div className="space-y-3">{techs.map(renderTopicCard)}</div>
          {techs.length === 0 && <p className="text-sm text-muted-foreground">No technologies added.</p>}
        </div>
      </div>
    </div>
  )
}
