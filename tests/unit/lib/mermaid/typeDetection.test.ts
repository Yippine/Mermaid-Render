import {
  detectChartType,
  isChartTypeSupported,
  getChartTypeDisplayName,
} from '@/lib/mermaid/typeDetection'
import { ChartType } from '@/types/mermaid.types'

describe('typeDetection', () => {
  describe('detectChartType', () => {
    it('should detect graph type', () => {
      const code = 'graph TD\n  A --> B'
      expect(detectChartType(code)).toBe('graph')
    })

    it('should detect flowchart type', () => {
      const code = 'flowchart LR\n  A --> B'
      expect(detectChartType(code)).toBe('flowchart')
    })

    it('should detect sequence diagram type', () => {
      const code = 'sequenceDiagram\n  Alice->>Bob: Hello'
      expect(detectChartType(code)).toBe('sequenceDiagram')
    })

    it('should detect class diagram type', () => {
      const code = 'classDiagram\n  class Animal'
      expect(detectChartType(code)).toBe('classDiagram')
    })

    it('should detect state diagram type', () => {
      const code = 'stateDiagram-v2\n  [*] --> State1'
      expect(detectChartType(code)).toBe('stateDiagram')
    })

    it('should detect journey type', () => {
      const code = 'journey\n  title My Journey'
      expect(detectChartType(code)).toBe('journey')
    })

    it('should detect git graph type', () => {
      const code = 'gitGraph\n  commit'
      expect(detectChartType(code)).toBe('gitGraph')
    })

    it('should return unknown for unrecognized types', () => {
      const code = 'unknownType\n  test'
      expect(detectChartType(code)).toBe('unknown')
    })

    it('should handle case insensitive detection', () => {
      const code = 'GRAPH TD\n  A --> B'
      expect(detectChartType(code)).toBe('graph')
    })

    it('should handle multiline code', () => {
      const code = `
        graph TD
        A --> B
        B --> C
      `
      expect(detectChartType(code)).toBe('graph')
    })

    it('should handle empty or whitespace code', () => {
      expect(detectChartType('')).toBe('unknown')
      expect(detectChartType('   ')).toBe('unknown')
      expect(detectChartType('\n\n')).toBe('unknown')
    })
  })

  describe('isChartTypeSupported', () => {
    it('should return true for supported chart types', () => {
      const supportedTypes: ChartType[] = [
        'graph',
        'flowchart',
        'sequenceDiagram',
        'classDiagram',
        'stateDiagram',
        'journey',
        'gitGraph',
      ]

      supportedTypes.forEach(type => {
        expect(isChartTypeSupported(type)).toBe(true)
      })
    })

    it('should return false for unknown type', () => {
      expect(isChartTypeSupported('unknown')).toBe(false)
    })
  })

  describe('getChartTypeDisplayName', () => {
    it('should return correct display names for chart types', () => {
      const expectedNames = {
        graph: '流程圖',
        flowchart: '流程圖',
        sequenceDiagram: '序列圖',
        classDiagram: '類別圖',
        stateDiagram: '狀態圖',
        journey: '使用者旅程圖',
        gitGraph: 'Git 圖表',
        unknown: '未知圖表類型',
      }

      Object.entries(expectedNames).forEach(([type, expectedName]) => {
        expect(getChartTypeDisplayName(type as ChartType)).toBe(expectedName)
      })
    })
  })
})
