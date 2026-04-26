migrate(
  (app) => {
    const projectsData = [
      {
        domainSlug: 'phase-1-fundamentals',
        title: 'Scikit-learn classification',
        desc: 'Build a basic classifier',
        diff: 'Beginner',
      },
      {
        domainSlug: 'phase-2-dl',
        title: 'MNIST Digit Recognizer',
        desc: 'Train a CNN to recognize handwritten digits',
        diff: 'Intermediate',
      },
      {
        domainSlug: 'phase-3-nlp-genai',
        title: 'Chatbot RAG',
        desc: 'Create a RAG-based chatbot using your own documents',
        diff: 'Intermediate',
      },
      {
        domainSlug: 'phase-4-cv',
        title: 'YOLOv8 detector',
        desc: 'Train an object detector for custom classes',
        diff: 'Advanced',
      },
      {
        domainSlug: 'phase-6-agentic-ai',
        title: 'Multi-Agent System',
        desc: 'Build a multi-agent system to solve a complex task',
        diff: 'Advanced',
      },
    ]

    const col = app.findCollectionByNameOrId('projects')

    for (const p of projectsData) {
      try {
        const domain = app.findFirstRecordByData('domains', 'slug', p.domainSlug)
        try {
          app.findFirstRecordByData('projects', 'title', p.title)
        } catch (_) {
          const record = new Record(col)
          record.set('domain_id', domain.id)
          record.set('title', p.title)
          record.set('description', p.desc)
          record.set('difficulty', p.diff)
          app.save(record)
        }
      } catch (e) {
        console.log('Domain not found for project: ' + p.title)
      }
    }
  },
  (app) => {},
)
