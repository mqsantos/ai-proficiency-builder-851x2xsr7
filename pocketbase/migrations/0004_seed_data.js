migrate(
  (app) => {
    // 1. Seed User
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let seededUserId = null
    try {
      const existingUser = app.findAuthRecordByEmail('_pb_users_auth_', 'mqsantos@gmail.com')
      seededUserId = existingUser.id
    } catch (_) {
      const record = new Record(users)
      record.setEmail('mqsantos@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin Explorer')
      app.save(record)
      seededUserId = record.id
    }

    const domainsCol = app.findCollectionByNameOrId('domains')
    const topicsCol = app.findCollectionByNameOrId('topics')

    const seedData = [
      {
        domain: {
          name: 'AI Agents',
          slug: 'ai-agents',
          icon: 'bot',
          color: '#f59e0b',
          description: 'Autonomous systems that perceive, decide, and act.',
        },
        skills: [
          'Reasoning & planning algorithms',
          'Goal decomposition & task orchestration',
          'Memory management (episodic & semantic)',
          'Tool integration & API calls',
          'Multi-agent communication protocols',
          'Agent evaluation & benchmarking',
        ],
        techs: [
          'AutoGPT',
          'BabyAGI',
          'CrewAI',
          'ReAct Framework',
          'HuggingGPT',
          'OpenAI Assistant API',
        ],
      },
      {
        domain: {
          name: 'Generative AI',
          slug: 'generative-ai',
          icon: 'sparkles',
          color: '#ec4899',
          description: 'Models that create new content, from text to images.',
        },
        skills: [
          'Prompt design & chaining',
          'Fine-tuning foundation models',
          'Multimodal integration',
          'Synthetic data generation',
          'Style transfer & personalization',
          'Responsible content generation',
        ],
        techs: [
          'GPT',
          'Claude',
          'Gemini',
          'MidJourney',
          'DALL-E',
          'Stable Diffusion',
          'Runway ML',
          'ElevenLabs',
          'Synthesia',
        ],
      },
      {
        domain: {
          name: 'Natural Language Processing',
          slug: 'nlp',
          icon: 'message-square',
          color: '#6366f1',
          description: 'Enabling computers to understand and process human language.',
        },
        skills: [
          'Text preprocessing & embeddings',
          'Named entity recognition (NER)',
          'Machine translation & summarization',
          'Semantic search & RAG pipelines',
          'Knowledge graph construction',
          'Conversational AI design',
        ],
        techs: [
          'Hugging Face Transformers',
          'spaCy',
          'NLTK',
          'OpenAI API',
          'RAG (LlamaIndex, LangChain)',
          'Elasticsearch',
          'Pinecone',
          'Weaviate',
        ],
      },
      {
        domain: {
          name: 'Computer Vision',
          slug: 'computer-vision',
          icon: 'eye',
          color: '#3b82f6',
          description: 'Giving machines the ability to see and interpret visual data.',
        },
        skills: [
          'Image preprocessing & augmentation',
          'Object detection & recognition',
          'Semantic & instance segmentation',
          '3D vision & reconstruction',
          'Video analytics & tracking',
          'AR/VR integration',
        ],
        techs: [
          'OpenCV',
          'PyTorch',
          'TensorFlow Vision',
          'YOLOv8',
          'Detectron2',
          'CLIP',
          'MediaPipe',
          'Nvidia DeepStream',
        ],
      },
      {
        domain: {
          name: 'Robotics & Autonomous Systems',
          slug: 'robotics',
          icon: 'cpu',
          color: '#10b981',
          description: 'Physical machines that operate autonomously in the real world.',
        },
        skills: [
          'Motion planning & SLAM',
          'Sensor fusion',
          'Reinforcement learning for robotics',
          'Real-time control systems',
          'Human-robot interaction',
          'Multi-robot coordination',
        ],
        techs: [
          'ROS',
          'Gazebo',
          'Nvidia Isaac Sim',
          'OpenAI Gym',
          'Boston Dynamics SDK',
          'DroneKit',
        ],
      },
      {
        domain: {
          name: 'AI Ethics & Governance',
          slug: 'ai-ethics',
          icon: 'scale',
          color: '#f43f5e',
          description: 'Ensuring AI systems are fair, transparent, and accountable.',
        },
        skills: [
          'Bias detection & mitigation',
          'Explainable AI (XAI) design',
          'Privacy-preserving AI',
          'AI auditing & compliance',
          'Policy frameworks',
          'Risk analysis & governance',
        ],
        techs: [
          'AI Fairness 360',
          'SHAP / LIME',
          'Google Responsible AI Toolkit',
          'Fairlearn',
          'Fiddler AI',
          'Ethical AI checklists',
        ],
      },
      {
        domain: {
          name: 'Deep Learning',
          slug: 'deep-learning',
          icon: 'layers',
          color: '#8b5cf6',
          description: 'Advanced neural networks powering modern AI breakthroughs.',
        },
        skills: [
          'Neural network architecture design',
          'Convolution & recurrent networks',
          'Attention & transformer models',
          'Transfer learning & fine-tuning',
          'GPU/TPU optimization',
          'Multimodal model training',
        ],
        techs: [
          'PyTorch Lightning',
          'Hugging Face Transformers',
          'Keras',
          'OpenVINO',
          'Nvidia CUDA/cuDNN',
          'ONNX',
        ],
      },
      {
        domain: {
          name: 'Machine Learning',
          slug: 'machine-learning',
          icon: 'brain-circuit',
          color: '#14b8a6',
          description: 'Core algorithms that allow systems to learn from data.',
        },
        skills: [
          'Data preprocessing & feature engineering',
          'Model selection & tuning',
          'Hyperparameter tuning',
          'Evaluation metrics',
          'Model deployment & MLOps',
          'Detecting model drift',
        ],
        techs: [
          'Scikit-learn',
          'TensorFlow',
          'PyTorch',
          'XGBoost / LightGBM',
          'MLflow',
          'Weights & Biases (W&B)',
        ],
      },
    ]

    for (const group of seedData) {
      let domainRecord
      try {
        domainRecord = app.findFirstRecordByData('domains', 'slug', group.domain.slug)
      } catch (_) {
        domainRecord = new Record(domainsCol)
        domainRecord.set('name', group.domain.name)
        domainRecord.set('slug', group.domain.slug)
        domainRecord.set('icon', group.domain.icon)
        domainRecord.set('color', group.domain.color)
        domainRecord.set('description', group.domain.description)
        app.save(domainRecord)
      }

      const insertTopic = (name, type) => {
        try {
          app.findFirstRecordByFilter(
            'topics',
            `domain_id = '${domainRecord.id}' && name = '${name.replace(/'/g, "''")}'`,
          )
        } catch (_) {
          const topicRecord = new Record(topicsCol)
          topicRecord.set('domain_id', domainRecord.id)
          topicRecord.set('name', name)
          topicRecord.set('type', type)
          app.save(topicRecord)
        }
      }

      for (const skill of group.skills) insertTopic(skill, 'skill')
      for (const tech of group.techs) insertTopic(tech, 'tech')
    }
  },
  (app) => {
    // Down migration: handled by cascade delete if domains are deleted, or we just truncate
    try {
      const domainsCol = app.findCollectionByNameOrId('domains')
      app.truncateCollection(domainsCol)
    } catch (_) {}
  },
)
