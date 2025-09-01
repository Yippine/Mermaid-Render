import { renderHook, act, waitFor } from '@testing-library/react'
import { useMermaidRenderer } from '@/hooks/useMermaidRenderer'
import { MermaidRenderer } from '@/lib/mermaid/MermaidRenderer'

// Mock MermaidRenderer
jest.mock('@/lib/mermaid/MermaidRenderer')

describe('useMermaidRenderer', () => {
  const mockRenderer = {
    render: jest.fn(),
    clearCache: jest.fn(),
    getCacheStats: jest.fn().mockReturnValue({
      size: 0,
      hitRate: 0.8,
      totalRequests: 100,
    }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(MermaidRenderer as jest.Mock).mockImplementation(() => mockRenderer)
  })

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useMermaidRenderer())

    expect(result.current.renderState).toBe('idle')
    expect(result.current.renderResult).toBeNull()
  })

  it('should render code successfully', async () => {
    const mockResult = {
      success: true,
      svg: '<svg>Test</svg>',
      metadata: {
        chartType: 'graph',
        renderTime: 100,
        nodeCount: 2,
        edgeCount: 1,
      },
      fromCache: false,
    }

    mockRenderer.render.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useMermaidRenderer(0)) // No debounce for testing

    await act(async () => {
      await result.current.render('graph TD\n  A --> B')
    })

    await waitFor(() => {
      expect(result.current.renderState).toBe('success')
    })

    expect(result.current.renderResult).toEqual(mockResult)
    expect(mockRenderer.render).toHaveBeenCalledWith('graph TD\n  A --> B', {})
  })

  it('should handle render errors', async () => {
    const mockErrorResult = {
      success: false,
      svg: '',
      error: {
        message: '語法錯誤',
        suggestion: '請檢查語法',
      },
      metadata: {
        chartType: 'unknown',
        renderTime: 0,
        nodeCount: 0,
        edgeCount: 0,
      },
      fromCache: false,
    }

    mockRenderer.render.mockResolvedValue(mockErrorResult)

    const { result } = renderHook(() => useMermaidRenderer(0))

    await act(async () => {
      await result.current.render('invalid syntax')
    })

    await waitFor(() => {
      expect(result.current.renderState).toBe('error')
    })

    expect(result.current.renderResult).toEqual(mockErrorResult)
  })

  it('should handle empty code', async () => {
    const { result } = renderHook(() => useMermaidRenderer(0))

    await act(async () => {
      await result.current.render('')
    })

    expect(result.current.renderState).toBe('idle')
    expect(result.current.renderResult).toBeNull()
    expect(mockRenderer.render).not.toHaveBeenCalled()
  })

  it('should handle whitespace-only code', async () => {
    const { result } = renderHook(() => useMermaidRenderer(0))

    await act(async () => {
      await result.current.render('   \n\n  ')
    })

    expect(result.current.renderState).toBe('idle')
    expect(result.current.renderResult).toBeNull()
    expect(mockRenderer.render).not.toHaveBeenCalled()
  })

  it('should debounce render calls', async () => {
    jest.useFakeTimers()

    const { result } = renderHook(() => useMermaidRenderer(300))

    act(() => {
      result.current.render('graph TD\n  A --> B')
      result.current.render('graph TD\n  A --> C')
      result.current.render('graph TD\n  A --> D')
    })

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(mockRenderer.render).toHaveBeenCalledTimes(1)
      expect(mockRenderer.render).toHaveBeenLastCalledWith(
        'graph TD\n  A --> D',
        {}
      )
    })

    jest.useRealTimers()
  })

  it('should clear cache', () => {
    const { result } = renderHook(() => useMermaidRenderer())

    act(() => {
      result.current.clearCache()
    })

    expect(mockRenderer.clearCache).toHaveBeenCalled()
  })

  it('should get cache stats', () => {
    const { result } = renderHook(() => useMermaidRenderer())

    const stats = result.current.getCacheStats()

    expect(stats).toEqual({
      size: 0,
      hitRate: 0.8,
      totalRequests: 100,
    })
    expect(mockRenderer.getCacheStats).toHaveBeenCalled()
  })

  it('should handle render with options', async () => {
    const mockResult = {
      success: true,
      svg: '<svg>Test</svg>',
      metadata: {
        chartType: 'graph',
        renderTime: 100,
        nodeCount: 2,
        edgeCount: 1,
      },
      fromCache: false,
    }

    mockRenderer.render.mockResolvedValue(mockResult)

    const { result } = renderHook(() => useMermaidRenderer(0))

    const options = { id: 'test-svg', theme: 'dark' }

    await act(async () => {
      await result.current.render('graph TD\n  A --> B', options)
    })

    expect(mockRenderer.render).toHaveBeenCalledWith(
      'graph TD\n  A --> B',
      options
    )
  })

  it('should handle render exceptions', async () => {
    mockRenderer.render.mockRejectedValue(new Error('Unexpected error'))

    const { result } = renderHook(() => useMermaidRenderer(0))

    await act(async () => {
      await result.current.render('graph TD\n  A --> B')
    })

    await waitFor(() => {
      expect(result.current.renderState).toBe('error')
    })

    expect(result.current.renderResult?.success).toBe(false)
    expect(result.current.renderResult?.error?.message).toContain(
      '未預期的錯誤'
    )
  })

  it('should show loading state during render', async () => {
    let resolveRender: (value: any) => void
    const renderPromise = new Promise(resolve => {
      resolveRender = resolve
    })
    mockRenderer.render.mockReturnValue(renderPromise)

    const { result } = renderHook(() => useMermaidRenderer(0))

    act(() => {
      result.current.render('graph TD\n  A --> B')
    })

    // Should be loading
    await waitFor(() => {
      expect(result.current.renderState).toBe('loading')
    })

    // Resolve the render
    act(() => {
      resolveRender!({
        success: true,
        svg: '<svg>Test</svg>',
        metadata: {
          chartType: 'graph' as const,
          renderTime: 100,
          nodeCount: 1,
          edgeCount: 0,
        },
        fromCache: false,
      })
    })

    await waitFor(() => {
      expect(result.current.renderState).toBe('success')
    })
  })
})
