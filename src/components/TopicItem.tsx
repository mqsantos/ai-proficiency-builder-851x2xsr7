import {
  Topic,
  Resource,
  UserProgress,
  deleteResource,
  createResource,
  updateResource,
  deleteTopic,
} from '@/services/api'
import { ProgressForm } from '@/components/forms/ProgressForm'
import { ResourceForm } from '@/components/forms/ResourceForm'
import { TopicForm } from '@/components/forms/TopicForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  Trash2,
  Edit2,
  Plus,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Clock,
  Circle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

interface Props {
  topic: Topic
  domainColor: string
  status: UserProgress['status']
  progressRecord?: UserProgress
  resources: Resource[]
  onUpdateProgress: (data: any) => Promise<void>
  onUpdateTopic: (id: string, data: any) => Promise<void>
  onDeleteTopic: (id: string) => Promise<void>
  onRefreshResources: () => void
}

export function TopicItem({
  topic,
  domainColor,
  status,
  progressRecord,
  resources,
  onUpdateProgress,
  onUpdateTopic,
  onDeleteTopic,
  onRefreshResources,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const isHighLevel = status === 'Expert' || status === 'Mentor of Others'

  const getStatusIcon = () => {
    switch (status) {
      case 'Mentor of Others':
        return <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
      case 'Expert':
        return <CheckCircle2 className="h-5 w-5" style={{ color: domainColor }} />
      case 'Familiar':
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case 'Learning':
        return <Clock className="h-5 w-5 text-amber-500" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'Mentor of Others':
        return <Badge className="bg-purple-500">Mentor</Badge>
      case 'Expert':
        return <Badge style={{ backgroundColor: domainColor }}>Expert</Badge>
      case 'Familiar':
        return (
          <Badge variant="secondary" className="text-blue-500">
            Familiar
          </Badge>
        )
      case 'Learning':
        return (
          <Badge variant="secondary" className="text-amber-500">
            Learning
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            None
          </Badge>
        )
    }
  }

  const handleCreateResource = async (data: any) => {
    try {
      await createResource({ ...data, topic_id: topic.id })
      onRefreshResources()
      toast.success('Resource added')
    } catch (e) {
      toast.error('Failed to add resource')
    }
  }

  const handleUpdateResource = async (id: string, data: any) => {
    try {
      await updateResource(id, data)
      onRefreshResources()
      toast.success('Resource updated')
    } catch (e) {
      toast.error('Failed to update resource')
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Delete resource?')) return
    try {
      await deleteResource(id)
      onRefreshResources()
      toast.success('Resource deleted')
    } catch (e) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div
      className={cn(
        'glass-panel rounded-xl overflow-hidden transition-all',
        isHighLevel ? 'bg-secondary/80 border-border/80' : '',
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
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
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {resources.length} Resources
            </button>
            <TopicForm initialData={topic} onSubmit={(d) => onUpdateTopic(topic.id, d)}>
              <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                <Edit2 className="h-3 w-3" /> Edit Topic
              </button>
            </TopicForm>
            <button
              onClick={() => onDeleteTopic(topic.id)}
              className="text-xs text-red-500/70 hover:text-red-500 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
        <ProgressForm
          initialData={progressRecord || { status: 'None' }}
          topicName={topic.name}
          onSubmit={onUpdateProgress}
        >
          <button className="p-2 rounded-full hover:bg-secondary transition-colors shrink-0">
            {getStatusIcon()}
          </button>
        </ProgressForm>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/10 space-y-3">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-medium">Resources</h5>
            <ResourceForm onSubmit={handleCreateResource}>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </ResourceForm>
          </div>
          {resources.length === 0 ? (
            <p className="text-xs text-muted-foreground">No resources yet.</p>
          ) : (
            resources.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between gap-3 text-sm p-2 rounded bg-white/5"
              >
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:underline text-primary/90 flex-1 truncate"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{res.title}</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                    {res.type}
                  </Badge>
                </a>
                <div className="flex items-center gap-1 shrink-0">
                  <ResourceForm initialData={res} onSubmit={(d) => handleUpdateResource(res.id, d)}>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </ResourceForm>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-400 hover:text-red-500"
                    onClick={() => handleDeleteResource(res.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
