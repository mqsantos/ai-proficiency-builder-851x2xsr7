import { useEffect, useState } from 'react'
import { getMentors, UserProgress } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, ExternalLink, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function FindMentors() {
  const [mentors, setMentors] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getMentors().then((m) => {
      setMentors(m)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 animate-pulse">Loading mentors...</div>

  const filteredMentors = mentors.filter((m) => {
    if (!search) return true
    const topic = m.expand?.topic_id?.name?.toLowerCase() || ''
    const domain = m.expand?.topic_id?.expand?.domain_id?.name?.toLowerCase() || ''
    const user = m.expand?.user_id?.name?.toLowerCase() || ''
    const s = search.toLowerCase()
    return topic.includes(s) || domain.includes(s) || user.includes(s)
  })

  // Group by topic
  const byTopic = filteredMentors.reduce(
    (acc, m) => {
      const topicId = m.topic_id
      if (!acc[topicId]) acc[topicId] = []
      acc[topicId].push(m)
      return acc
    },
    {} as Record<string, UserProgress[]>,
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" /> Find Mentors
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with experts who are available to guide you on specific topics.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by topic, domain or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(byTopic).map(([topicId, users]) => {
          const topic = users[0]?.expand?.topic_id
          const domain = topic?.expand?.domain_id
          if (!topic || !domain) return null

          return (
            <Card key={topicId} className="glass-panel overflow-hidden">
              <div className="h-1 w-full" style={{ background: domain.color }} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{ borderColor: domain.color, color: domain.color }}
                  >
                    {domain.name}
                  </Badge>
                  <CardTitle className="text-lg">{topic.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-4">
                  {users.map((u) => {
                    const user = u.expand?.user_id
                    if (!user) return null
                    return (
                      <div
                        key={u.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5"
                      >
                        <Avatar
                          className="h-10 w-10 border-2"
                          style={{ borderColor: domain.color }}
                        >
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          />
                          <AvatarFallback>M</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {user.name || user.email.split('@')[0]}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary"
                          >
                            Mentor Level
                          </Badge>
                          {u.evidence_url && (
                            <a
                              href={u.evidence_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" /> View Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {filteredMentors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No mentors match your search.</div>
      )}
    </div>
  )
}
