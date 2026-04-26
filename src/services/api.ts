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
  status: UserProgress['status'],
) => {
  try {
    const existing = await pb
      .collection('user_progress')
      .getFirstListItem<UserProgress>(`user_id="${userId}" && topic_id="${topicId}"`)
    return pb.collection('user_progress').update<UserProgress>(existing.id, { status })
  } catch (err) {
    return pb
      .collection('user_progress')
      .create<UserProgress>({ user_id: userId, topic_id: topicId, status })
  }
}
