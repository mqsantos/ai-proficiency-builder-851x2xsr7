import { useEffect, useState, useMemo } from 'react'
import {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  Resource,
} from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ExternalLink,
  Video,
  FileText,
  GraduationCap,
  FileCode2,
  Search,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { ResourceForm } from '@/components/forms/ResourceForm'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const { user } = useAuth()
  const { toast } = useToast()

  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)

  const loadResources = async () => {
    try {
      const r = await getAllResources()
      setResources(r)
    } catch (err) {
      toast({ title: 'Error loading resources', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const searchLower = searchQuery.toLowerCase()
      const titleMatch = res.title.toLowerCase().includes(searchLower)
      const topicMatch = (res.expand?.topic_id?.name || '').toLowerCase().includes(searchLower)
      const matchesSearch = titleMatch || topicMatch
      const matchesType = typeFilter === 'All' || res.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [resources, searchQuery, typeFilter])

  const handleCreate = async (data: any) => {
    try {
      await createResource(data)
      toast({ title: 'Resource added successfully' })
      loadResources()
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      toast({
        title: 'Error adding resource',
        description: Object.values(fieldErrors)[0] || err.message,
        variant: 'destructive',
      })
      throw err
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateResource(id, data)
      toast({ title: 'Resource updated successfully' })
      loadResources()
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      toast({
        title: 'Error updating resource',
        description: Object.values(fieldErrors)[0] || err.message,
        variant: 'destructive',
      })
      throw err
    }
  }

  const handleDelete = async () => {
    if (!resourceToDelete) return
    try {
      await deleteResource(resourceToDelete.id)
      toast({ title: 'Resource deleted successfully' })
      loadResources()
    } catch (err: any) {
      toast({ title: 'Error deleting resource', description: err.message, variant: 'destructive' })
    } finally {
      setResourceToDelete(null)
    }
  }

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

  if (loading) return <div className="p-8 animate-pulse">Loading library...</div>

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Resource Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore all learning materials curated across different domains and topics.
          </p>
        </div>
        {user && (
          <ResourceForm onSubmit={handleCreate}>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </ResourceForm>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or topic..."
            className="pl-9 bg-background/50 backdrop-blur-sm border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 backdrop-blur-sm border-white/10">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="Article">Article</SelectItem>
            <SelectItem value="Course">Course</SelectItem>
            <SelectItem value="Documentation">Documentation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((res) => (
          <Card
            key={res.id}
            className="glass-panel flex flex-col h-full hover:border-primary/50 transition-colors group relative overflow-hidden"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(res.type)}
                  <Badge variant="outline" className="text-xs">
                    {res.type}
                  </Badge>
                </div>
              </div>
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="block group-hover:text-primary transition-colors pr-10"
              >
                <CardTitle className="text-base line-clamp-2">{res.title}</CardTitle>
              </a>
            </CardHeader>
            <CardContent className="pb-4 flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {res.description || 'No description available.'}
              </p>
              <div className="flex items-center gap-2 text-xs mt-auto">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: res.expand?.topic_id?.expand?.domain_id?.color || '#fff' }}
                />
                <span className="truncate max-w-[120px] font-medium text-foreground/80">
                  {res.expand?.topic_id?.expand?.domain_id?.name}
                </span>
                <span className="text-muted-foreground shrink-0">&bull;</span>
                <span className="truncate text-muted-foreground">{res.expand?.topic_id?.name}</span>
              </div>
            </CardContent>
            {user && (
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-md rounded-md p-1 border border-white/10 shadow-sm focus-within:opacity-100">
                <ResourceForm initialData={res} onSubmit={(data) => handleUpdate(res.id, data)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </ResourceForm>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setResourceToDelete(res)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10 backdrop-blur-sm">
          <FileText className="h-10 w-10 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground/80">No resources found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      <AlertDialog
        open={!!resourceToDelete}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the resource "{resourceToDelete?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
