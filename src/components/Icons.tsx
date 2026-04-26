import {
  Bot,
  Sparkles,
  MessageSquare,
  Eye,
  Cpu,
  Scale,
  Layers,
  BrainCircuit,
  Activity,
} from 'lucide-react'
import React from 'react'

export const getIcon = (name: string, props?: React.ComponentProps<typeof Bot>) => {
  switch (name) {
    case 'bot':
      return <Bot {...props} />
    case 'sparkles':
      return <Sparkles {...props} />
    case 'message-square':
      return <MessageSquare {...props} />
    case 'eye':
      return <Eye {...props} />
    case 'cpu':
      return <Cpu {...props} />
    case 'scale':
      return <Scale {...props} />
    case 'layers':
      return <Layers {...props} />
    case 'brain-circuit':
      return <BrainCircuit {...props} />
    default:
      return <Activity {...props} />
  }
}
