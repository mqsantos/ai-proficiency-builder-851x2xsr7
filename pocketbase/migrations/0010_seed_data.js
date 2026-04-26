migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'mqsantos@gmail.com')
    } catch (_) {
      return
    }

    const topics = app.findRecordsByFilter('topics', '1=1', '', 10)
    if (topics.length === 0) return

    const resourcesCol = app.findCollectionByNameOrId('resources')
    const progressCol = app.findCollectionByNameOrId('user_progress')

    const resourcesData = [
      {
        title: 'Introduction to Agentic AI',
        url: 'https://example.com/agentic-ai',
        type: 'Video',
        description: 'A great overview of autonomous agents.',
        topic_id: topics[0].id,
      },
      {
        title: 'Deep Learning Foundations',
        url: 'https://example.com/dl',
        type: 'Course',
        description: 'Core concepts of Neural Networks.',
        topic_id: topics[1]?.id || topics[0].id,
      },
      {
        title: 'AI Ethics Guidelines',
        url: 'https://example.com/ethics',
        type: 'Documentation',
        description: 'How to build responsible AI systems.',
        topic_id: topics[2]?.id || topics[0].id,
      },
    ]

    for (const data of resourcesData) {
      try {
        app.findFirstRecordByData('resources', 'title', data.title)
      } catch (_) {
        const record = new Record(resourcesCol)
        record.set('title', data.title)
        record.set('url', data.url)
        record.set('type', data.type)
        record.set('description', data.description)
        record.set('topic_id', data.topic_id)
        app.save(record)
      }
    }

    try {
      const existing = app.findFirstRecordByData('user_progress', 'user_id', user.id)
      existing.set('status', 'Mentor of Others')
      existing.set(
        'notes',
        'I have implemented multiple autonomous agents in production environments.',
      )
      existing.set('evidence_url', 'https://github.com/skip-ai/agents')
      existing.set('is_available_to_mentor', true)
      app.save(existing)
    } catch (_) {
      const prog = new Record(progressCol)
      prog.set('user_id', user.id)
      prog.set('topic_id', topics[0].id)
      prog.set('status', 'Mentor of Others')
      prog.set('notes', 'I have implemented multiple autonomous agents in production environments.')
      prog.set('evidence_url', 'https://github.com/skip-ai/agents')
      prog.set('is_available_to_mentor', true)
      app.save(prog)
    }
  },
  (app) => {},
)
