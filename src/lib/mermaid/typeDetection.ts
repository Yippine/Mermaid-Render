import { ChartType, SUPPORTED_CHART_TYPES } from '@/types/mermaid.types'

export const detectChartType = (code: string): ChartType => {
  const firstLine = code.trim().split('\n')[0].toLowerCase()

  // Check more specific types first to avoid conflicts
  if (firstLine.includes('gitgraph')) {
    return 'gitGraph'
  }
  if (firstLine.includes('flowchart')) {
    return 'flowchart'
  }
  if (firstLine.includes('sequencediagram')) {
    return 'sequenceDiagram'
  }
  if (firstLine.includes('classdiagram')) {
    return 'classDiagram'
  }
  if (firstLine.includes('statediagram')) {
    return 'stateDiagram'
  }
  if (firstLine.includes('journey')) {
    return 'journey'
  }
  if (firstLine.includes('graph')) {
    return 'graph'
  }

  return 'unknown'
}

export const isChartTypeSupported = (chartType: ChartType): boolean => {
  return SUPPORTED_CHART_TYPES.includes(chartType)
}

export const getChartTypeDisplayName = (chartType: ChartType): string => {
  const displayNames: Record<ChartType, string> = {
    graph: '流程圖',
    flowchart: '流程圖',
    sequenceDiagram: '序列圖',
    classDiagram: '類別圖',
    stateDiagram: '狀態圖',
    journey: '使用者旅程圖',
    gitGraph: 'Git 圖表',
    unknown: '未知圖表類型',
  }

  return displayNames[chartType] || '未知圖表類型'
}
