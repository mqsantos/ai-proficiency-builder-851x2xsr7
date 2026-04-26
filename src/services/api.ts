import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Domain extends RecordModel {
  name: string
  slug: string
  description: string
  level?: string
  duration?: string
  icon: string
  color: string
}

export interface Topic extends RecordModel {
  domain_id: string
  name: string
  description?: string
  type: 'skill' | 'tech'
  is_gap_suggestion?: boolean
}

export interface User extends RecordModel {
  name?: string
  avatar?: string
  xp?: number
  streak_count?: number
  last_activity_at?: string
  bio?: string
  headline?: string
  is_public?: boolean
  slug?: string
}

export interface Project extends RecordModel {
  domain_id: string
  title: string
  description?: string
  difficulty?: string
  expand?: {
    domain_id?: Domain
  }
}

export interface UserProject extends RecordModel {
  user_id: string
  project_id: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  repo_url?: string
  demo_url?: string
  expand?: {
    project_id?: Project & { expand?: { domain_id?: Domain } }
  }
}

export interface UserProgress extends RecordModel {
  user_id: string
  topic_id: string
  status: 'None' | 'Learning' | 'Familiar' | 'Expert' | 'Mentor of Others'
  notes?: string
  evidence_url?: string
  is_available_to_mentor?: boolean
  expand?: {
    user_id?: any
    topic_id?: Topic & { expand?: { domain_id?: Domain } }
  }
}

export interface Resource extends RecordModel {
  topic_id: string
  title: string
  url: string
  type: 'Video' | 'Article' | 'Course' | 'Documentation'
  description?: string
  expand?: {
    topic_id?: Topic & { expand?: { domain_id?: Domain } }
  }
}

export const getDomains = () => pb.collection('domains').getFullList<Domain>({ sort: 'created' })

export const getDomainBySlug = (slug: string) =>
  pb.collection('domains').getFirstListItem<Domain>(`slug="${slug}"`)

export const getTopicsByDomain = (domainId: string) =>
  pb
    .collection('topics')
    .getFullList<Topic>({ filter: `domain_id="${domainId}"`, sort: 'type,name' })

export const getAllTopics = () => pb.collection('topics').getFullList<Topic>({ sort: 'name' })

export const getUserProgress = (userId?: string) =>
  pb.collection('user_progress').getFullList<UserProgress>({
    filter: userId ? `user_id="${userId}"` : '',
    expand: 'topic_id,topic_id.domain_id',
  })

export const upsertProgress = async (
  userId: string,
  topicId: string,
  data: Partial<UserProgress>,
) => {
  try {
    const existing = await pb
      .collection('user_progress')
      .getFirstListItem<UserProgress>(`user_id="${userId}" && topic_id="${topicId}"`)
    return pb.collection('user_progress').update<UserProgress>(existing.id, data)
  } catch (err) {
    return pb
      .collection('user_progress')
      .create<UserProgress>({ user_id: userId, topic_id: topicId, ...data })
  }
}

export const createDomain = (data: Partial<Domain>) => pb.collection('domains').create<Domain>(data)
export const updateDomain = (id: string, data: Partial<Domain>) =>
  pb.collection('domains').update<Domain>(id, data)
export const deleteDomain = (id: string) => pb.collection('domains').delete(id)

export const createTopic = (data: Partial<Topic>) => pb.collection('topics').create<Topic>(data)
export const updateTopic = (id: string, data: Partial<Topic>) =>
  pb.collection('topics').update<Topic>(id, data)
export const deleteTopic = (id: string) => pb.collection('topics').delete(id)

export const getResourcesByTopic = (topicId: string) =>
  pb
    .collection('resources')
    .getFullList<Resource>({ filter: `topic_id="${topicId}"`, sort: '-created' })
export const getAllResources = () =>
  pb
    .collection('resources')
    .getFullList<Resource>({ expand: 'topic_id,topic_id.domain_id', sort: '-created' })
export const createResource = (data: Partial<Resource>) =>
  pb.collection('resources').create<Resource>(data)
export const updateResource = (id: string, data: Partial<Resource>) =>
  pb.collection('resources').update<Resource>(id, data)
export const deleteResource = (id: string) => pb.collection('resources').delete(id)

export const getMentors = () =>
  pb.collection('user_progress').getFullList<UserProgress>({
    filter: 'is_available_to_mentor=true',
    expand: 'user_id,topic_id,topic_id.domain_id',
  })

export const getProjectsByDomain = (domainId: string) =>
  pb
    .collection('projects')
    .getFullList<Project>({ filter: `domain_id="${domainId}"`, sort: 'created' })

export const getAllProjects = () =>
  pb.collection('projects').getFullList<Project>({ expand: 'domain_id', sort: 'created' })

export const getUserProjects = (userId: string) =>
  pb.collection('user_projects').getFullList<UserProject>({
    filter: `user_id="${userId}"`,
    expand: 'project_id,project_id.domain_id',
  })

export const updateUserProfile = (id: string, data: Partial<User>) =>
  pb.collection('users').update<User>(id, data)

export const getUserBySlug = (slug: string) =>
  pb.collection('users').getFirstListItem<User>(`slug="${slug}" && is_public=true`)

export const deleteUserProgress = (id: string) => pb.collection('user_progress').delete(id)
export const deleteUserProject = (id: string) => pb.collection('user_projects').delete(id)

export const upsertUserProject = async (
  userId: string,
  projectId: string,
  data: Partial<UserProject>,
) => {
  try {
    const existing = await pb
      .collection('user_projects')
      .getFirstListItem<UserProject>(`user_id="${userId}" && project_id="${projectId}"`)
    return pb.collection('user_projects').update<UserProject>(existing.id, data)
  } catch (err) {
    return pb
      .collection('user_projects')
      .create<UserProject>({ user_id: userId, project_id: projectId, ...data })
  }
}
