// 延遲導入 mermaid 以支援 SSR
import { RenderOptions, RenderResult } from '@/types/mermaid.types'
import { detectChartType, isChartTypeSupported } from './typeDetection'
import { ErrorHandler } from './errorHandler'
import { RenderCache } from './renderCache'

export class MermaidRenderer {
  private cache: RenderCache
  private errorHandler: ErrorHandler
  private isInitialized = false
  private mermaid: typeof import('mermaid').default | null = null

  constructor() {
    this.cache = new RenderCache()
    this.errorHandler = new ErrorHandler()
  }

  private cleanupMermaidErrors(): void {
    // Remove any mermaid error elements that might be appended to the DOM
    const errorSelectors = [
      '.mermaid-error',
      '[id^="mermaid-"]',
      '.mermaidTooltip',
      '.d3-tip',
    ]

    errorSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        if (
          element.textContent?.includes('Syntax error') ||
          element.textContent?.includes('mermaid version')
        ) {
          element.remove()
        }
      })
    })

    // Also remove any text nodes containing mermaid errors
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: node => {
          return node.textContent?.includes('Syntax error in text') ||
            node.textContent?.includes('mermaid version')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT
        },
      }
    )

    const textNodes: Text[] = []
    let node = walker.nextNode()
    while (node) {
      textNodes.push(node as Text)
      node = walker.nextNode()
    }

    textNodes.forEach(textNode => {
      if (textNode.parentElement) {
        textNode.parentElement.remove()
      }
    })
  }

  private async initializeMermaid(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('Loading Mermaid...')
      // 動態導入 mermaid 以支援 SSR
      const mermaidModule = await import('mermaid')
      this.mermaid = mermaidModule.default

      console.log('Initializing Mermaid...')
      this.mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        logLevel: 'silent', // Prevent mermaid errors from appearing in DOM
      })

      // Clean up any existing mermaid error elements in the DOM
      this.cleanupMermaidErrors()
      console.log('Mermaid initialized successfully')
      this.isInitialized = true
    } catch (error) {
      console.error('Mermaid initialization failed:', error)
      // 即使初始化失敗也標記為已嘗試，避免重複嘗試
      this.isInitialized = true
    }
  }

  async render(
    code: string,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    console.log('Starting render with code:', code.substring(0, 100) + '...')
    await this.initializeMermaid()

    if (!this.mermaid) {
      return this.errorHandler.handleRenderError(
        new Error('Mermaid failed to load properly'),
        code
      )
    }

    const cacheKey = this.generateCacheKey(code, options)
    console.log('Generated cache key:', cacheKey)

    // 檢查快取
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return {
        success: true,
        svg: cached.svg,
        metadata: cached.metadata,
        fromCache: true,
      }
    }

    try {
      // 檢測圖表類型
      const chartType = detectChartType(code)

      if (!isChartTypeSupported(chartType)) {
        return this.errorHandler.handleRenderError(
          new Error(`Unsupported chart type: ${chartType}`),
          code
        )
      }

      // 渲染圖表
      console.log('Rendering chart type:', chartType)
      const startTime = performance.now()
      const element = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
      console.log('Calling mermaid.render with element:', element)
      const { svg } = await this.mermaid.render(element, code)
      const renderTime = performance.now() - startTime
      console.log('Mermaid render completed, SVG length:', svg.length)

      // 後處理 SVG
      const processedSvg = this.postProcessSVG(svg, options)

      const result: RenderResult = {
        success: true,
        svg: processedSvg,
        metadata: {
          chartType,
          renderTime,
          nodeCount: this.countNodes(processedSvg),
          edgeCount: this.countEdges(processedSvg),
        },
        fromCache: false,
      }

      // 快取結果
      this.cache.set(cacheKey, processedSvg, result.metadata)

      return result
    } catch (error) {
      // Clean up any DOM errors that might have been created
      this.cleanupMermaidErrors()
      return this.errorHandler.handleRenderError(error, code)
    }
  }

  private generateCacheKey(code: string, options: RenderOptions): string {
    const optionsStr = JSON.stringify(options)
    return `${this.utf8ToBase64(code.trim())}-${this.utf8ToBase64(optionsStr)}`
  }

  private utf8ToBase64(str: string): string {
    // 為了支援中文字符，我們使用更簡單但穩定的方法
    // 直接使用 hash 算法，避免 btoa 的字符編碼問題
    return this.simpleHash(str)
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 轉為 32 位整數
    }
    return hash.toString(36)
  }

  private postProcessSVG(svg: string, options: RenderOptions): string {
    let processed = svg

    // 設定 ID
    if (options.id) {
      processed = processed.replace(/id="[^"]*"/g, `id="${options.id}"`)
    }

    // 添加自訂樣式標記
    processed = processed.replace(
      /<style>/g,
      '<style>/* Mermaid Generated - Enhanced for Mermaid-Render */'
    )

    // 設定背景色
    if (options.background) {
      processed = processed.replace(
        /<svg([^>]*)>/,
        `<svg$1 style="background-color: ${options.background};">`
      )
    }

    // 確保 SVG 具有適當的 viewBox 和尺寸屬性
    if (!processed.includes('viewBox')) {
      processed = processed.replace(
        /<svg([^>]*)width="(\d+)"([^>]*)height="(\d+)"([^>]*)>/,
        '<svg$1$3$5 viewBox="0 0 $2 $4" width="$2" height="$4">'
      )
    }

    return processed
  }

  private countNodes(svg: string): number {
    // 簡化的節點計數 - 計算 g 元素中的節點
    const nodeMatches = svg.match(/<g[^>]*class="[^"]*node[^"]*"[^>]*>/g)
    return nodeMatches ? nodeMatches.length : 0
  }

  private countEdges(svg: string): number {
    // 簡化的邊線計數 - 計算路徑和線條
    const edgeMatches = svg.match(/<g[^>]*class="[^"]*edge[^"]*"[^>]*>/g)
    const pathMatches = svg.match(/<path[^>]*>/g)
    return (
      (edgeMatches ? edgeMatches.length : 0) +
      (pathMatches ? pathMatches.length / 2 : 0)
    )
  }

  getCacheStats() {
    return this.cache.getStats()
  }

  clearCache(): void {
    this.cache.clear()
  }

  setTheme(theme: 'light' | 'dark' | 'neutral'): void {
    const themeConfigs = {
      light: {
        theme: 'default',
        themeVariables: {
          primaryColor: '#0066cc',
          primaryTextColor: '#000000',
          primaryBorderColor: '#0066cc',
          lineColor: '#666666',
          sectionBkgColor: '#ffffff',
          altSectionBkgColor: '#f9f9f9',
          gridColor: '#cccccc',
          textColor: '#000000',
        },
      },
      dark: {
        theme: 'dark',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#1e40af',
          lineColor: '#6b7280',
          sectionBkgColor: '#1f2937',
          altSectionBkgColor: '#374151',
          gridColor: '#4b5563',
          textColor: '#f9fafb',
        },
      },
      neutral: {
        theme: 'neutral',
        themeVariables: {
          primaryColor: '#6b7280',
          primaryTextColor: '#000000',
          primaryBorderColor: '#6b7280',
          lineColor: '#9ca3af',
          sectionBkgColor: '#f3f4f6',
          altSectionBkgColor: '#e5e7eb',
          gridColor: '#d1d5db',
          textColor: '#111827',
        },
      },
    }

    if (this.mermaid) {
      this.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        logLevel: 'silent',
        ...themeConfigs[theme],
      })
    }

    // Clear cache when theme changes
    this.clearCache()
  }
}
