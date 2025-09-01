import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractiveSVG } from '@/components/preview/InteractiveSVG'

describe('InteractiveSVG', () => {
  const mockSvgContent = '<svg><g><text>Test SVG Content</text></g></svg>'

  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      top: 100,
      left: 100,
      bottom: 700,
      right: 900,
      toJSON: jest.fn(),
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render SVG content', () => {
    render(<InteractiveSVG svgContent={mockSvgContent} />)

    expect(
      screen.getByRole('img', { name: /interactive mermaid diagram/i })
    ).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument() // Zoom indicator
  })

  it('should handle wheel zoom in', async () => {
    const onTransformChange = jest.fn()
    render(
      <InteractiveSVG
        svgContent={mockSvgContent}
        onTransformChange={onTransformChange}
      />
    )

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Simulate zoom in (negative deltaY)
    fireEvent.wheel(container, { deltaY: -100 })

    await waitFor(() => {
      expect(screen.getByText('110%')).toBeInTheDocument()
    })

    expect(onTransformChange).toHaveBeenCalledWith({
      x: expect.any(Number),
      y: expect.any(Number),
      scale: expect.any(Number),
    })
  })

  it('should handle wheel zoom out', async () => {
    render(<InteractiveSVG svgContent={mockSvgContent} />)

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Simulate zoom out (positive deltaY)
    fireEvent.wheel(container, { deltaY: 100 })

    await waitFor(() => {
      expect(screen.getByText('90%')).toBeInTheDocument()
    })
  })

  it('should prevent zooming below 10%', async () => {
    render(<InteractiveSVG svgContent={mockSvgContent} />)

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Simulate multiple zoom outs to test minimum
    for (let i = 0; i < 20; i++) {
      fireEvent.wheel(container, { deltaY: 100 })
    }

    await waitFor(() => {
      expect(screen.getByText('10%')).toBeInTheDocument()
    })
  })

  it('should prevent zooming above 500%', async () => {
    render(<InteractiveSVG svgContent={mockSvgContent} />)

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Simulate multiple zoom ins to test maximum
    for (let i = 0; i < 20; i++) {
      fireEvent.wheel(container, { deltaY: -100 })
    }

    await waitFor(() => {
      expect(screen.getByText('500%')).toBeInTheDocument()
    })
  })

  it('should handle drag to pan', async () => {
    const onTransformChange = jest.fn()
    render(
      <InteractiveSVG
        svgContent={mockSvgContent}
        onTransformChange={onTransformChange}
      />
    )

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Start drag
    fireEvent.mouseDown(container, { button: 0, clientX: 100, clientY: 100 })

    // Move mouse
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 })

    // End drag
    fireEvent.mouseUp(document)

    expect(onTransformChange).toHaveBeenCalledWith({
      x: 50, // Moved 50px right
      y: 50, // Moved 50px down
      scale: 1,
    })
  })

  it('should reset transform on double click', async () => {
    const onTransformChange = jest.fn()
    render(
      <InteractiveSVG
        svgContent={mockSvgContent}
        onTransformChange={onTransformChange}
      />
    )

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // First zoom and pan
    fireEvent.wheel(container, { deltaY: -100 })
    fireEvent.mouseDown(container, { button: 0, clientX: 0, clientY: 0 })
    fireEvent.mouseMove(document, { clientX: 50, clientY: 50 })
    fireEvent.mouseUp(document)

    // Then double click to reset
    fireEvent.doubleClick(container)

    expect(onTransformChange).toHaveBeenLastCalledWith({
      x: 0,
      y: 0,
      scale: 1,
    })
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    const onTransformChange = jest.fn()

    render(
      <InteractiveSVG
        svgContent={mockSvgContent}
        onTransformChange={onTransformChange}
      />
    )

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Focus container
    container.focus()

    // Test arrow keys
    await user.keyboard('{ArrowUp}')
    expect(onTransformChange).toHaveBeenLastCalledWith({
      x: 0,
      y: 20, // Move up 20px
      scale: 1,
    })

    await user.keyboard('{ArrowRight}')
    expect(onTransformChange).toHaveBeenLastCalledWith({
      x: -20, // Move right -20px
      y: 20,
      scale: 1,
    })

    // Test zoom keys
    onTransformChange.mockClear()
    await user.keyboard('{=}') // Zoom in
    expect(onTransformChange).toHaveBeenCalledWith({
      x: -20,
      y: 20,
      scale: 1.2,
    })

    await user.keyboard('{-}') // Zoom out
    expect(onTransformChange).toHaveBeenLastCalledWith({
      x: -20,
      y: 20,
      scale: 0.96, // 1.2 * 0.8
    })

    // Test reset key
    await user.keyboard('{0}')
    expect(onTransformChange).toHaveBeenLastCalledWith({
      x: 0,
      y: 0,
      scale: 1,
    })
  })

  it('should ignore right mouse button for dragging', () => {
    const onTransformChange = jest.fn()
    render(
      <InteractiveSVG
        svgContent={mockSvgContent}
        onTransformChange={onTransformChange}
      />
    )

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Right mouse button drag
    fireEvent.mouseDown(container, { button: 2, clientX: 100, clientY: 100 })
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 })
    fireEvent.mouseUp(document)

    // Should not call onTransformChange for panning
    expect(onTransformChange).not.toHaveBeenCalled()
  })

  it('should show cursor states correctly', () => {
    render(<InteractiveSVG svgContent={mockSvgContent} />)

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })

    // Initial cursor should be grab
    expect(container).toHaveClass('cursor-grab')

    // Start dragging
    fireEvent.mouseDown(container, { button: 0, clientX: 100, clientY: 100 })

    // Should show grabbing cursor
    expect(container).toHaveClass('cursor-grabbing')
  })

  it('should apply custom className', () => {
    render(
      <InteractiveSVG svgContent={mockSvgContent} className='custom-class' />
    )

    const container = screen.getByRole('img', {
      name: /interactive mermaid diagram/i,
    })
    expect(container).toHaveClass('custom-class')
  })

  it('should show keyboard shortcuts in help text', () => {
    render(<InteractiveSVG svgContent={mockSvgContent} />)

    expect(screen.getByText('滾輪：縮放')).toBeInTheDocument()
    expect(screen.getByText('拖拽：平移')).toBeInTheDocument()
    expect(screen.getByText('雙擊：重置')).toBeInTheDocument()
    expect(screen.getByText('方向鍵：微調位置')).toBeInTheDocument()
    expect(screen.getByText('+/-：縮放 | 0：重置')).toBeInTheDocument()
  })

  it('should show development coordinates in development mode', () => {
    // Create a new process.env object with development mode
    const devEnv = { ...process.env, NODE_ENV: 'development' as const }

    // Mock process.env
    const mockProcessEnv = jest.spyOn(process, 'env', 'get')
    mockProcessEnv.mockReturnValue(devEnv as NodeJS.ProcessEnv)

    render(<InteractiveSVG svgContent={mockSvgContent} />)

    expect(screen.getByText('(0, 0)')).toBeInTheDocument()

    mockProcessEnv.mockRestore()
  })
})
