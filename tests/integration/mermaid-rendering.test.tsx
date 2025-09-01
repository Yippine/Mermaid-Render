/**
 * 整合測試：Mermaid 渲染系統
 * 測試從程式碼輸入到 SVG 輸出的完整流程
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MermaidPreview } from '@/components/preview/MermaidPreview'

// Mock mermaid module with real-like behavior
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn(),
  getConfig: jest.fn(() => ({})),
}))

describe('Mermaid Rendering Integration', () => {
  const mockMermaid = require('mermaid')

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful render by default
    mockMermaid.render.mockImplementation((id: string, code: string) => {
      // Simulate different chart types
      if (code.includes('graph TD')) {
        return Promise.resolve({
          svg: `<svg id="${id}"><g class="node">A</g><g class="node">B</g><g class="edge">A-B</g></svg>`,
        })
      }
      if (code.includes('sequenceDiagram')) {
        return Promise.resolve({
          svg: `<svg id="${id}"><g class="actor">Alice</g><g class="actor">Bob</g><path class="message"></path></svg>`,
        })
      }
      if (code.includes('classDiagram')) {
        return Promise.resolve({
          svg: `<svg id="${id}"><g class="class">Animal</g></svg>`,
        })
      }

      return Promise.resolve({
        svg: `<svg id="${id}"><g>Generic Chart</g></svg>`,
      })
    })
  })

  describe('End-to-End Rendering Flow', () => {
    it('should render complete flowchart workflow', async () => {
      const code = `
        graph TD
        A[開始] --> B{判斷}
        B -->|是| C[處理]
        B -->|否| D[結束]
        C --> D
      `

      const onRenderComplete = jest.fn()

      render(
        <MermaidPreview
          code={code}
          debounceMs={0}
          onRenderComplete={onRenderComplete}
        />
      )

      // Should show loading initially
      expect(screen.getByText('正在渲染圖表...')).toBeInTheDocument()

      // Wait for render completion
      await waitFor(
        () => {
          expect(onRenderComplete).toHaveBeenCalledWith(
            true, // success
            expect.objectContaining({
              chartType: 'graph',
              renderTime: expect.any(Number),
              nodeCount: expect.any(Number),
              edgeCount: expect.any(Number),
            })
          )
        },
        { timeout: 3000 }
      )

      // Should render interactive SVG
      expect(
        screen.getByRole('img', { name: /interactive mermaid diagram/i })
      ).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument() // Zoom indicator
    })

    it('should handle sequence diagram rendering', async () => {
      const code = `
        sequenceDiagram
        participant Alice
        participant Bob
        Alice->>Bob: 你好
        Bob-->>Alice: 你好，Alice！
      `

      const onRenderComplete = jest.fn()

      render(
        <MermaidPreview
          code={code}
          debounceMs={0}
          onRenderComplete={onRenderComplete}
        />
      )

      await waitFor(() => {
        expect(onRenderComplete).toHaveBeenCalledWith(
          true,
          expect.objectContaining({
            chartType: 'sequenceDiagram',
          })
        )
      })

      expect(mockMermaid.render).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('sequenceDiagram')
      )
    })

    it('should handle class diagram rendering', async () => {
      const code = `
        classDiagram
        class Animal {
          +String name
          +makeSound()
        }
        class Dog {
          +bark()
        }
        Animal <|-- Dog
      `

      const onRenderComplete = jest.fn()

      render(
        <MermaidPreview
          code={code}
          debounceMs={0}
          onRenderComplete={onRenderComplete}
        />
      )

      await waitFor(() => {
        expect(onRenderComplete).toHaveBeenCalledWith(
          true,
          expect.objectContaining({
            chartType: 'classDiagram',
          })
        )
      })
    })
  })

  describe('Error Handling Flow', () => {
    it('should handle syntax errors gracefully', async () => {
      mockMermaid.render.mockRejectedValue(new Error('Parse error on line 2'))

      const code = `
        graph TD
        A --> 
        B --> C
      `

      const onRenderComplete = jest.fn()

      render(
        <MermaidPreview
          code={code}
          debounceMs={0}
          onRenderComplete={onRenderComplete}
        />
      )

      await waitFor(() => {
        expect(onRenderComplete).toHaveBeenCalledWith(false)
      })

      // Should show error display
      expect(screen.getByText('語法錯誤')).toBeInTheDocument()
      expect(screen.getByText(/語法解析錯誤/)).toBeInTheDocument()
      expect(screen.getByText('重新渲染')).toBeInTheDocument()
    })

    it('should allow retry after error', async () => {
      let renderCount = 0
      mockMermaid.render.mockImplementation(() => {
        renderCount++
        if (renderCount === 1) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          svg: '<svg><g>Success after retry</g></svg>',
        })
      })

      const code = 'graph TD\nA --> B'

      const onRenderComplete = jest.fn()

      render(
        <MermaidPreview
          code={code}
          debounceMs={0}
          onRenderComplete={onRenderComplete}
        />
      )

      // First render should fail
      await waitFor(() => {
        expect(screen.getByText('語法錯誤')).toBeInTheDocument()
      })

      // Click retry button
      const retryButton = screen.getByText('重新渲染')
      await userEvent.click(retryButton)

      // Should succeed on retry
      await waitFor(() => {
        expect(onRenderComplete).toHaveBeenLastCalledWith(
          true,
          expect.any(Object)
        )
      })

      expect(
        screen.getByRole('img', { name: /interactive mermaid diagram/i })
      ).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('should support zoom and pan interactions', async () => {
      const code = 'graph TD\nA --> B'

      render(<MermaidPreview code={code} debounceMs={0} />)

      await waitFor(() => {
        expect(
          screen.getByRole('img', { name: /interactive mermaid diagram/i })
        ).toBeInTheDocument()
      })

      const container = screen.getByRole('img', {
        name: /interactive mermaid diagram/i,
      })

      // Mock getBoundingClientRect
      container.getBoundingClientRect = jest.fn(() => ({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        toJSON: jest.fn(),
      }))

      // Test zoom
      fireEvent.wheel(container, { deltaY: -100 })

      await waitFor(() => {
        expect(screen.getByText('110%')).toBeInTheDocument()
      })

      // Test double-click reset
      fireEvent.doubleClick(container)

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument()
      })
    })

    it('should handle keyboard shortcuts', async () => {
      const user = userEvent.setup()
      const code = 'graph TD\nA --> B'

      render(<MermaidPreview code={code} debounceMs={0} />)

      await waitFor(() => {
        expect(
          screen.getByRole('img', { name: /interactive mermaid diagram/i })
        ).toBeInTheDocument()
      })

      const container = screen.getByRole('img', {
        name: /interactive mermaid diagram/i,
      })

      // Focus and test keyboard shortcuts
      container.focus()
      await user.keyboard('{=}') // Zoom in

      await waitFor(() => {
        expect(screen.getByText('120%')).toBeInTheDocument()
      })

      await user.keyboard('{0}') // Reset

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Caching', () => {
    it('should use cache for repeated renders', async () => {
      const code = 'graph TD\nA --> B'

      const { rerender } = render(<MermaidPreview code={code} debounceMs={0} />)

      // First render
      await waitFor(() => {
        expect(mockMermaid.render).toHaveBeenCalledTimes(1)
      })

      // Re-render with same code
      rerender(<MermaidPreview code={code} debounceMs={0} />)

      // Should not call mermaid.render again (uses cache)
      await waitFor(() => {
        expect(mockMermaid.render).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle debounced updates', async () => {
      jest.useFakeTimers()

      const { rerender } = render(
        <MermaidPreview code='graph TD\nA --> B' debounceMs={300} />
      )

      // Multiple rapid updates
      rerender(<MermaidPreview code='graph TD\nA --> C' debounceMs={300} />)
      rerender(<MermaidPreview code='graph TD\nA --> D' debounceMs={300} />)
      rerender(<MermaidPreview code='graph TD\nA --> E' debounceMs={300} />)

      // Should not render yet
      expect(mockMermaid.render).not.toHaveBeenCalled()

      // Advance timers
      jest.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockMermaid.render).toHaveBeenCalledTimes(1)
        expect(mockMermaid.render).toHaveBeenLastCalledWith(
          expect.any(String),
          'graph TD\nA --> E'
        )
      })

      jest.useRealTimers()
    })
  })

  describe('Empty State Handling', () => {
    it('should show empty state for no code', () => {
      render(<MermaidPreview code='' debounceMs={0} />)

      expect(screen.getByText('開始輸入 Mermaid 程式碼')).toBeInTheDocument()
      expect(screen.getByText('您的圖表將在此處即時顯示')).toBeInTheDocument()
      expect(mockMermaid.render).not.toHaveBeenCalled()
    })

    it('should show empty state for whitespace-only code', () => {
      render(<MermaidPreview code='   \n\n  ' debounceMs={0} />)

      expect(screen.getByText('開始輸入 Mermaid 程式碼')).toBeInTheDocument()
      expect(mockMermaid.render).not.toHaveBeenCalled()
    })
  })

  describe('Chart Type Support', () => {
    const chartTypes = [
      { type: 'graph', code: 'graph TD\nA --> B' },
      { type: 'flowchart', code: 'flowchart LR\nA --> B' },
      { type: 'sequenceDiagram', code: 'sequenceDiagram\nAlice->>Bob: Hello' },
      { type: 'classDiagram', code: 'classDiagram\nclass Animal' },
      { type: 'stateDiagram', code: 'stateDiagram-v2\n[*] --> State1' },
      { type: 'journey', code: 'journey\ntitle My Journey' },
      { type: 'gitGraph', code: 'gitGraph\ncommit' },
    ]

    chartTypes.forEach(({ type, code }) => {
      it(`should render ${type} charts`, async () => {
        const onRenderComplete = jest.fn()

        render(
          <MermaidPreview
            code={code}
            debounceMs={0}
            onRenderComplete={onRenderComplete}
          />
        )

        await waitFor(() => {
          expect(onRenderComplete).toHaveBeenCalledWith(
            true,
            expect.objectContaining({
              chartType: type,
            })
          )
        })
      })
    })
  })
})
