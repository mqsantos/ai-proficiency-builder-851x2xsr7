migrate(
  (app) => {
    const topicsData = [
      {
        domainSlug: 'phase-1-fundamentals',
        name: 'Probabilidade e estatística básica',
        type: 'skill',
        isGap: true,
      },
      { domainSlug: 'phase-1-fundamentals', name: 'Python para ML', type: 'tech', isGap: false },
      {
        domainSlug: 'phase-2-dl',
        name: 'Redes Neurais Convolucionais (CNNs)',
        type: 'skill',
        isGap: false,
      },
      {
        domainSlug: 'phase-3-nlp-genai',
        name: 'Transformers e Attention',
        type: 'skill',
        isGap: false,
      },
      {
        domainSlug: 'phase-3-nlp-genai',
        name: 'LangChain & LlamaIndex',
        type: 'tech',
        isGap: false,
      },
      { domainSlug: 'phase-4-cv', name: 'Object Detection (YOLO)', type: 'skill', isGap: false },
      { domainSlug: 'phase-6-agentic-ai', name: 'AutoGPT & BabyAGI', type: 'tech', isGap: false },
      { domainSlug: 'phase-8-architecture', name: 'MLOps & Deploy', type: 'skill', isGap: false },
    ]

    const col = app.findCollectionByNameOrId('topics')

    for (const t of topicsData) {
      try {
        const domain = app.findFirstRecordByData('domains', 'slug', t.domainSlug)
        try {
          const existing = app.findFirstRecordByData('topics', 'name', t.name)
          existing.set('is_gap_suggestion', t.isGap)
          app.save(existing)
        } catch (_) {
          const record = new Record(col)
          record.set('domain_id', domain.id)
          record.set('name', t.name)
          record.set('type', t.type)
          record.set('is_gap_suggestion', t.isGap)
          app.save(record)
        }
      } catch (e) {
        console.log('Domain not found for topic: ' + t.name)
      }
    }
  },
  (app) => {},
)
