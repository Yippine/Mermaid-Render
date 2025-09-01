import { useState, useCallback, useRef, useEffect } from 'react'
import { RenderState, RenderResult, RenderOptions } from '@/types/mermaid.types'
import { MermaidRenderer } from '@/lib/mermaid/MermaidRenderer'

export interface UseMermaidRendererReturn {
  renderState: RenderState
  renderResult: RenderResult | null
  render: (code: string, options?: RenderOptions) => Promise<void>
  clearCache: () => void
  getCacheStats: () => { size: number; hitRate: number; totalRequests: number }
}

// 防抖函數保留供未來使用
// function debounce(
//   func: (code: string, options?: RenderOptions) => Promise<void>,
//   wait: number
// ): (code: string, options?: RenderOptions) => void {
//   let timeout: NodeJS.Timeout | null = null
//
//   return (code: string, options?: RenderOptions) => {
//     if (timeout) {
//       clearTimeout(timeout)
//     }
//
//     timeout = setTimeout(() => {
//       func(code, options)
//     }, wait)
//   }
// }

export const useMermaidRenderer = (
  // debounceMs 參數保留供未來使用
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debounceMs: number = 300
): UseMermaidRendererReturn => {
  const [renderState, setRenderState] = useState<RenderState>('idle')
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null)

  const rendererRef = useRef<MermaidRenderer>()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize renderer
  if (!rendererRef.current) {
    rendererRef.current = new MermaidRenderer()
  }

  const performRender = useCallback(
    async (code: string, options: RenderOptions = {}) => {
      if (!code.trim()) {
        setRenderState('idle')
        setRenderResult(null)
        return
      }

      // Cancel previous render if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this render
      abortControllerRef.current = new AbortController()
      const currentController = abortControllerRef.current

      try {
        setRenderState('loading')

        const result = await rendererRef.current!.render(code, options)

        // Check if this render was cancelled
        if (currentController.signal.aborted) {
          return
        }

        setRenderResult(result)
        setRenderState(result.success ? 'success' : 'error')
      } catch (error) {
        // Check if this render was cancelled
        if (currentController.signal.aborted) {
          return
        }

        console.error('Render error:', error)
        setRenderState('error')
        setRenderResult({
          success: false,
          svg: '',
          error: {
            message: '渲染過程中發生未預期的錯誤',
            suggestion: '請檢查程式碼語法或聯繫支援團隊',
          },
          metadata: {
            chartType: 'unknown',
            renderTime: 0,
            nodeCount: 0,
            edgeCount: 0,
          },
          fromCache: false,
        })
      }
    },
    []
  )

  // 保留防抖函數以供未來使用
  // const debouncedRender = useMemo(
  //   () => debounce(performRender, debounceMs),
  //   [performRender, debounceMs]
  // )

  const render = useCallback(
    async (code: string, options?: RenderOptions): Promise<void> => {
      // 確保立即觸發渲染，避免防抖動造成的延遲問題
      await performRender(code, options)
    },
    [performRender]
  )

  const clearCache = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.clearCache()
    }
  }, [])

  const getCacheStats = useCallback(() => {
    return (
      rendererRef.current?.getCacheStats() || {
        size: 0,
        hitRate: 0,
        totalRequests: 0,
      }
    )
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    renderState,
    renderResult,
    render,
    clearCache,
    getCacheStats,
  }
}
