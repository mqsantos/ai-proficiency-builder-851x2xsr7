import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Domain extends RecordModel {
  name: string
  slug: string
  description: string
  icon: string
  color: string
}

export interface Topic extends RecordModel {
  domain_id: string
  name: string
  description?: string
  type: 'skill' | 'tech'
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

export const getUserProgress = () =>
  pb
    .collection('user_progress')
    .getFullList<UserProgress>({ expand: 'topic_id,topic_id.domain_id' })

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
