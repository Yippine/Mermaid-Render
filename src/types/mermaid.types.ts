export type RenderState = 'idle' | 'loading' | 'success' | 'error'

export type LayoutAlgorithm = 'elk' | 'dagre' | 'force-directed' | 'circular'

export type AnimationState = 'idle' | 'playing' | 'paused' | 'completed'

export type ChartType =
  | 'graph'
  | 'flowchart'
  | 'sequenceDiagram'
  | 'classDiagram'
  | 'stateDiagram'
  | 'journey'
  | 'gitGraph'
  | 'unknown'

export interface RenderOptions {
  id?: string
  theme?: string
  width?: number
  height?: number
  background?: string
}

export interface RenderMetadata {
  chartType: ChartType
  renderTime: number
  nodeCount: number
  edgeCount: number
}

export interface RenderResult {
  success: boolean
  svg: string
  metadata: RenderMetadata
  fromCache: boolean
  error?: MermaidError
}

export interface MermaidError {
  message: string
  line?: number
  column?: number
  suggestion?: string
}

export interface CacheEntry {
  svg: string
  timestamp: number
  metadata: RenderMetadata
}

export const SUPPORTED_CHART_TYPES: readonly ChartType[] = [
  'graph',
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'journey',
  'gitGraph',
] as const
