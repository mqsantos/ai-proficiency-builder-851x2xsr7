import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDomains, getUserProgress, Domain, UserProgress } from '@/services/api'
import { getIcon } from '@/components/Icons'
import { Progress } from '@/components/ui/progress'
import { useRealtime } from '@/hooks/use-realtime'

export default function Index() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const [dData, pData] = await Promise.all([getDomains(), getUserProgress()])
    setDomains(dData)
    setProgress(pData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('user_progress', () => {
    getUserProgress().then(setProgress)
  })

  if (loading)
    return (
      <div className="animate-pulse flex gap-4 p-8">
        <div className="h-32 w-full bg-slate-800 rounded-xl" />
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          AI Skills & Technologies Map
        </h1>
        <p className="mt-2 text-lg text-slate-400">
          Select a domain to begin or continue your mastery.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domains.map((domain) => {
          // Calculate progress for this domain
          const domainProgress = progress.filter((p) => p.expand?.topic_id?.domain_id === domain.id)
          const total =
            progress.length > 0
              ? progress.filter((p) => p.expand?.topic_id?.domain_id === domain.id).length
              : 0 // Fallback approximation if no progress items yet
          const mastered = domainProgress.filter((p) => p.status === 'mastered').length
          // Approximate total items if not fetched perfectly (ideally we'd count topics per domain, but progress is only created when interacted. Let's assume progress records exist for all or we just show mastered count for now).
          // For better UI, let's just show mastered count over a static number or just a visual score.

          return (
            <Link key={domain.id} to={`/domain/${domain.slug}`} className="block outline-none">
              <div
                className="glass-panel glow-hover group relative flex h-full flex-col justify-between rounded-xl p-6 overflow-hidden"
                style={{ '--glow-color': domain.color } as React.CSSProperties}
              >
                <div
                  className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: domain.color }}
                />

                <div>
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg shadow-lg"
                    style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                  >
                    {getIcon(domain.icon, { className: 'h-6 w-6' })}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{domain.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{domain.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <span>Mastery</span>
                    <span className="font-mono font-medium" style={{ color: domain.color }}>
                      {mastered} skills
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
