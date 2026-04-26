import { Project, UserProject } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Github, Play, CheckCircle2, Clock } from 'lucide-react'
import { UserProjectForm } from '@/components/forms/UserProjectForm'

interface Props {
  project: Project
  userProject?: UserProject
  domainColor: string
  onUpdate: (projectId: string, data: any) => Promise<void>
}

export function ProjectItem({ project, userProject, domainColor, onUpdate }: Props) {
  const status = userProject?.status || 'Not Started'

  return (
    <div
      className="glass-panel p-4 rounded-xl border-l-4 flex flex-col justify-between"
      style={{ borderLeftColor: domainColor }}
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="pr-4">
            <h4 className="font-bold text-lg">{project.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          </div>
          <UserProjectForm
            initialData={userProject}
            project={project}
            onSubmit={(data) => onUpdate(project.id, data)}
          >
            <Button variant="secondary" size="sm" className="shrink-0">
              {status === 'Not Started' ? 'Start' : 'Update'}
            </Button>
          </UserProjectForm>
        </div>
        <div className="flex gap-2 mt-4 items-center">
          <Badge variant="outline" className="text-xs">
            {project.difficulty}
          </Badge>
          {status === 'Completed' && (
            <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
            </Badge>
          )}
          {status === 'In Progress' && (
            <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">
              <Clock className="w-3 h-3 mr-1" /> In Progress
            </Badge>
          )}
        </div>
      </div>

      {status === 'Completed' && (userProject?.repo_url || userProject?.demo_url) && (
        <div className="mt-4 p-3 bg-secondary/30 rounded-lg flex gap-4">
          {userProject.repo_url && (
            <a
              href={userProject.repo_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-sm hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4 mr-2" /> Repository
            </a>
          )}
          {userProject.demo_url && (
            <a
              href={userProject.demo_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-sm hover:text-primary transition-colors"
            >
              <Play className="w-4 h-4 mr-2" /> Live Demo
            </a>
          )}
        </div>
      )}
    </div>
  )
}
