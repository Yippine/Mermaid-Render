import { MermaidRenderer } from '@/lib/mermaid/MermaidRenderer'
import { RenderOptions } from '@/types/mermaid.types'

// Mock mermaid module
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn(),
  getConfig: jest.fn(() => ({})),
}))

describe('MermaidRenderer', () => {
  let renderer: MermaidRenderer
  const mockMermaid = require('mermaid')

  beforeEach(() => {
    renderer = new MermaidRenderer()
    jest.clearAllMocks()

    // Setup default mock return value
    mockMermaid.render.mockResolvedValue({
      svg: '<svg><g>Test SVG</g></svg>',
    })
  })

  afterEach(() => {
    renderer.clearCache()
  })

  describe('render', () => {
    it('should render simple flowchart successfully', async () => {
      const code = 'graph TD\n  A --> B'
      const result = await renderer.render(code)

      expect(result.success).toBe(true)
      expect(result.svg).toContain('<svg')
      expect(result.metadata.chartType).toBe('graph')
      expect(result.fromCache).toBe(false)
      expect(mockMermaid.render).toHaveBeenCalled()
    })

    it('should detect sequence diagram type correctly', async () => {
      const code = 'sequenceDiagram\n  Alice->>Bob: Hello'
      const result = await renderer.render(code)

      expect(result.success).toBe(true)
      expect(result.metadata.chartType).toBe('sequenceDiagram')
    })

    it('should handle syntax errors gracefully', async () => {
      mockMermaid.render.mockRejectedValue(new Error('Parse error on line 2'))

      const code = 'invalid mermaid syntax'
      const result = await renderer.render(code)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBeDefined()
      expect(result.error?.suggestion).toBeDefined()
      expect(result.svg).toBe('')
    })

    it('should return cached result on second render', async () => {
      const code = 'graph TD\n  A --> B'

      // First render
      const result1 = await renderer.render(code)
      expect(result1.fromCache).toBe(false)

      // Second render should use cache
      const result2 = await renderer.render(code)
      expect(result2.fromCache).toBe(true)
      expect(result2.svg).toBe(result1.svg)

      // Mermaid should only be called once
      expect(mockMermaid.render).toHaveBeenCalledTimes(1)
    })

    it('should handle unsupported chart types', async () => {
      const code = 'unsupportedType\n  test'
      const result = await renderer.render(code)

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('不支援的圖表類型')
    })

    it('should apply render options correctly', async () => {
      const code = 'graph TD\n  A --> B'
      const options: RenderOptions = {
        id: 'test-svg',
        background: '#ffffff',
      }

      const result = await renderer.render(code, options)

      expect(result.success).toBe(true)
      expect(result.svg).toContain('#ffffff')
      expect(result.svg).toContain('style="background-color: #ffffff;"')
    })

    it('should measure render time', async () => {
      // Add delay to mermaid render
      mockMermaid.render.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ svg: '<svg>Test</svg>' }), 10)
          )
      )

      const code = 'graph TD\n  A --> B'
      const result = await renderer.render(code)

      expect(result.metadata.renderTime).toBeGreaterThan(0)
    })

    it('should count nodes and edges', async () => {
      mockMermaid.render.mockResolvedValue({
        svg: '<svg><g class="node">Node1</g><g class="node">Node2</g><g class="edge">Edge1</g></svg>',
      })

      const code = 'graph TD\n  A --> B'
      const result = await renderer.render(code)

      expect(result.metadata.nodeCount).toBeGreaterThan(0)
      expect(result.metadata.edgeCount).toBeGreaterThan(0)
    })
  })

  describe('cache management', () => {
    it('should provide cache statistics', () => {
      const stats = renderer.getCacheStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('totalRequests')
      expect(typeof stats.size).toBe('number')
    })

    it('should clear cache', async () => {
      const code = 'graph TD\n  A --> B'

      // Render to populate cache
      await renderer.render(code)
      let stats = renderer.getCacheStats()
      expect(stats.size).toBeGreaterThan(0)

      // Clear cache
      renderer.clearCache()
      stats = renderer.getCacheStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('theme management', () => {
    it('should set light theme', () => {
      renderer.setTheme('light')
      expect(mockMermaid.initialize).toHaveBeenCalled()
    })

    it('should set dark theme', () => {
      renderer.setTheme('dark')
      expect(mockMermaid.initialize).toHaveBeenCalled()
    })

    it('should set neutral theme', () => {
      renderer.setTheme('neutral')
      expect(mockMermaid.initialize).toHaveBeenCalled()
    })

    it('should clear cache when theme changes', async () => {
      const code = 'graph TD\n  A --> B'

      // Render to populate cache
      await renderer.render(code)
      let stats = renderer.getCacheStats()
      expect(stats.size).toBeGreaterThan(0)

      // Change theme should clear cache
      renderer.setTheme('light')
      stats = renderer.getCacheStats()
      expect(stats.size).toBe(0)
    })
  })
})
