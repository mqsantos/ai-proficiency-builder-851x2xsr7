import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getDomainBySlug,
  getTopicsByDomain,
  getUserProgress,
  upsertProgress,
  Domain,
  Topic,
  UserProgress,
} from '@/services/api'
import { getIcon } from '@/components/Icons'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Circle, Clock } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export default function DomainDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [domain, setDomain] = useState<Domain | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [progress, setProgress] = useState<Record<string, UserProgress['status']>>({})
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!slug) return
    try {
      const d = await getDomainBySlug(slug)
      setDomain(d)

      const [tData, pData] = await Promise.all([getTopicsByDomain(d.id), getUserProgress()])

      setTopics(tData)

      const progMap: Record<string, UserProgress['status']> = {}
      pData.forEach((p) => {
        if (p.user_id === user?.id) progMap[p.topic_id] = p.status
      })
      setProgress(progMap)
    } catch (e) {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [slug])

  useRealtime('user_progress', (e) => {
    if (e.record.user_id === user?.id) {
      setProgress((prev) => ({ ...prev, [e.record.topic_id]: e.record.status as any }))
    }
  })

  const handleToggleStatus = async (topicId: string, currentStatus: string = 'unstarted') => {
    if (!user) return
    const nextStatus: Record<string, UserProgress['status']> = {
      unstarted: 'learning',
      learning: 'mastered',
      mastered: 'unstarted',
    }
    const newStatus = nextStatus[currentStatus]

    // Optimistic
    setProgress((prev) => ({ ...prev, [topicId]: newStatus }))

    try {
      await upsertProgress(user.id, topicId, newStatus)
      if (newStatus === 'mastered')
        toast.success('Skill mastered!', {
          style: { background: domain?.color, color: '#fff', border: 'none' },
        })
    } catch (err) {
      // Revert
      setProgress((prev) => ({ ...prev, [topicId]: currentStatus as any }))
      toast.error('Failed to update progress')
    }
  }

  if (loading || !domain) return <div className="animate-pulse h-64 bg-slate-800 rounded-xl m-8" />

  const skills = topics.filter((t) => t.type === 'skill')
  const techs = topics.filter((t) => t.type === 'tech')

  const getStatusIcon = (status?: string, color?: string) => {
    if (status === 'mastered') return <CheckCircle2 className="h-5 w-5" style={{ color }} />
    if (status === 'learning') return <Clock className="h-5 w-5 text-amber-400" />
    return <Circle className="h-5 w-5 text-slate-600" />
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 text-slate-400 hover:text-white -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roadmap
      </Button>

      <div
        className="glass-panel rounded-2xl p-8 mb-10 border-t-4"
        style={{ borderTopColor: domain.color }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-slate-800" style={{ color: domain.color }}>
            {getIcon(domain.icon, { className: 'h-8 w-8' })}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{domain.name}</h1>
            <p className="text-slate-400 mt-1">{domain.description}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Skills Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-slate-400" /> Core Skills
          </h2>
          <div className="space-y-3">
            {skills.map((topic) => (
              <div
                key={topic.id}
                className={`glass-panel p-4 rounded-xl flex items-center justify-between transition-colors ${progress[topic.id] === 'mastered' ? 'bg-slate-800/80 border-slate-700' : ''}`}
              >
                <div>
                  <h4
                    className={`font-medium ${progress[topic.id] === 'mastered' ? 'text-slate-300' : 'text-slate-100'}`}
                  >
                    {topic.name}
                  </h4>
                </div>
                <button
                  onClick={() => handleToggleStatus(topic.id, progress[topic.id])}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
                >
                  {getStatusIcon(progress[topic.id], domain.color)}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-slate-400" /> Technologies & Tools
          </h2>
          <div className="space-y-3">
            {techs.map((topic) => (
              <div
                key={topic.id}
                className={`glass-panel p-4 rounded-xl flex items-center justify-between transition-colors ${progress[topic.id] === 'mastered' ? 'bg-slate-800/80 border-slate-700' : ''}`}
              >
                <div>
                  <h4
                    className={`font-mono text-sm ${progress[topic.id] === 'mastered' ? 'text-slate-400' : 'text-primary-foreground/90'}`}
                  >
                    {topic.name}
                  </h4>
                </div>
                <button
                  onClick={() => handleToggleStatus(topic.id, progress[topic.id])}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
                >
                  {getStatusIcon(progress[topic.id], domain.color)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
