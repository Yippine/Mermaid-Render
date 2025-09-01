export interface GraphNode {
  id: string
  label: string
  position?: {
    x: number
    y: number
  }
  style?: NodeStyle
  metadata?: NodeMetadata
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
  style?: EdgeStyle
  animationSequence?: number
}

export interface NodeStyle {
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  shape?: 'rectangle' | 'ellipse' | 'diamond' | 'triangle'
  fontSize?: number
  fontFamily?: string
}

export interface EdgeStyle {
  color?: string
  width?: number
  style?: 'solid' | 'dashed' | 'dotted'
  arrowColor?: string
}

export interface NodeMetadata {
  type?: string
  description?: string
  [key: string]: unknown
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata?: {
    title?: string
    description?: string
    layout?: LayoutAlgorithm
  }
}

export type LayoutAlgorithm = 'elk' | 'dagre' | 'force-directed' | 'circular'
export type AnimationState = 'idle' | 'playing' | 'paused' | 'completed'
