migrate(
  (app) => {
    const domainsData = [
      {
        name: '1. Fundamentos de IA e ML',
        slug: 'phase-1-fundamentals',
        level: 'Beginner',
        duration: '2-3 months',
        icon: 'BookOpen',
        color: '#3b82f6',
        description: 'Learn the basics of AI and ML',
      },
      {
        name: '2. Deep Learning',
        slug: 'phase-2-dl',
        level: 'Intermediate',
        duration: '3-4 months',
        icon: 'BrainCircuit',
        color: '#8b5cf6',
        description: 'Neural Networks and deep architectures',
      },
      {
        name: '3. NLP & Generative AI',
        slug: 'phase-3-nlp-genai',
        level: 'Intermediate',
        duration: '4-5 months',
        icon: 'MessageSquare',
        color: '#ec4899',
        description: 'Text processing and Large Language Models',
      },
      {
        name: '4. Computer Vision',
        slug: 'phase-4-cv',
        level: 'Advanced',
        duration: '3-4 months',
        icon: 'Eye',
        color: '#10b981',
        description: 'Image processing and object detection',
      },
      {
        name: '5. Robotics & Autonomous Systems',
        slug: 'phase-5-robotics',
        level: 'Advanced',
        duration: '4-6 months',
        icon: 'Bot',
        color: '#f59e0b',
        description: 'Control systems and reinforcement learning',
      },
      {
        name: '6. Agentic AI',
        slug: 'phase-6-agentic-ai',
        level: 'Advanced',
        duration: '3-5 months',
        icon: 'Cpu',
        color: '#ef4444',
        description: 'Autonomous AI agents and workflows',
      },
      {
        name: '7. AI Ethics & Governance',
        slug: 'phase-7-ethics',
        level: 'Senior',
        duration: '2-3 months',
        icon: 'Scale',
        color: '#64748b',
        description: 'Responsible AI and compliance',
      },
      {
        name: '8. Arquitetura de Sistemas de IA',
        slug: 'phase-8-architecture',
        level: 'Senior',
        duration: '4-6 months',
        icon: 'Layers',
        color: '#0f766e',
        description: 'Designing scalable AI systems at enterprise level',
      },
    ]

    const col = app.findCollectionByNameOrId('domains')

    for (const d of domainsData) {
      try {
        const existing = app.findFirstRecordByData('domains', 'slug', d.slug)
        existing.set('level', d.level)
        existing.set('duration', d.duration)
        app.save(existing)
      } catch (_) {
        const record = new Record(col)
        record.set('name', d.name)
        record.set('slug', d.slug)
        record.set('level', d.level)
        record.set('duration', d.duration)
        record.set('icon', d.icon)
        record.set('color', d.color)
        record.set('description', d.description)
        app.save(record)
      }
    }
  },
  (app) => {},
)
