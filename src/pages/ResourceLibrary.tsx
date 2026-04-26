import { useEffect, useState } from 'react'
import { getAllResources, Resource } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Video, FileText, GraduationCap, FileCode2 } from 'lucide-react'

export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllResources().then((r) => {
      setResources(r)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 animate-pulse">Loading library...</div>

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="h-4 w-4 text-rose-500" />
      case 'Article':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'Course':
        return <GraduationCap className="h-4 w-4 text-amber-500" />
      case 'Documentation':
        return <FileCode2 className="h-4 w-4 text-emerald-500" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Resource Library</h1>
        <p className="text-muted-foreground mt-1">
          Explore all learning materials curated across different domains and topics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((res) => (
          <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="block group">
            <Card className="glass-panel h-full hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  {getTypeIcon(res.type)}
                  <Badge variant="outline" className="text-xs">
                    {res.type}
                  </Badge>
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                  {res.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {res.description || 'No description available.'}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: res.expand?.topic_id?.expand?.domain_id?.color || '#fff' }}
                  />
                  <span className="truncate max-w-[120px] font-medium text-foreground/80">
                    {res.expand?.topic_id?.expand?.domain_id?.name}
                  </span>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="truncate text-muted-foreground">
                    {res.expand?.topic_id?.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
      {resources.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No resources found. Add some in the topic details pages.
        </div>
      )}
    </div>
  )
}
