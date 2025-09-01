import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResizablePanel } from '@/components/layout/ResizablePanel'
import { useEditorStore } from '@/stores/editorStore'

// Mock the editor store
jest.mock('@/stores/editorStore')
const mockUseEditorStore = useEditorStore as jest.MockedFunction<
  typeof useEditorStore
>

const mockStore = {
  panelRatio: 0.5,
  setPanelRatio: jest.fn(),
  isEditorCollapsed: false,
  isPreviewCollapsed: false,
  resetPanels: jest.fn(),
}

const LeftPanelContent = () => <div data-testid='left-content'>左側內容</div>
const RightPanelContent = () => <div data-testid='right-content'>右側內容</div>

describe('ResizablePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEditorStore.mockReturnValue(mockStore)

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 1000,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('應該渲染左右兩個面板', () => {
    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    expect(screen.getByTestId('left-content')).toBeInTheDocument()
    expect(screen.getByTestId('right-content')).toBeInTheDocument()
    expect(screen.getByTestId('resizer')).toBeInTheDocument()
  })

  it('應該以正確的比例顯示面板', () => {
    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    const leftPanel = screen.getByTestId('left-panel')
    const rightPanel = screen.getByTestId('right-panel')

    expect(leftPanel).toHaveStyle('width: 50%')
    expect(rightPanel).toHaveStyle('width: 50%')
  })

  it('編輯器摺疊時應該隱藏左側面板', () => {
    mockUseEditorStore.mockReturnValue({
      ...mockStore,
      isEditorCollapsed: true,
    })

    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    const leftPanel = screen.getByTestId('left-panel')
    const rightPanel = screen.getByTestId('right-panel')

    expect(leftPanel).toHaveStyle('width: 0%')
    expect(rightPanel).toHaveStyle('width: 100%')
    expect(screen.queryByTestId('left-content')).not.toBeInTheDocument()
  })

  it('預覽摺疊時應該隱藏右側面板', () => {
    mockUseEditorStore.mockReturnValue({
      ...mockStore,
      isPreviewCollapsed: true,
    })

    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    const leftPanel = screen.getByTestId('left-panel')
    const rightPanel = screen.getByTestId('right-panel')

    expect(leftPanel).toHaveStyle('width: 100%')
    expect(rightPanel).toHaveStyle('width: 0%')
    expect(screen.queryByTestId('right-content')).not.toBeInTheDocument()
  })

  it('兩個面板都摺疊時不應該顯示分隔線', () => {
    mockUseEditorStore.mockReturnValue({
      ...mockStore,
      isEditorCollapsed: true,
      isPreviewCollapsed: true,
    })

    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    expect(screen.queryByTestId('resizer')).not.toBeInTheDocument()
  })

  it('應該處理滑鼠拖拽事件', async () => {
    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    const resizer = screen.getByTestId('resizer')

    // 模擬拖拽
    fireEvent.mouseDown(resizer, { clientX: 500 })

    // 驗證游標樣式被設定
    expect(document.body.style.cursor).toBe('col-resize')

    // 模擬滑鼠移動
    fireEvent.mouseMove(document, { clientX: 600 })

    // 驗證 setPanelRatio 被呼叫
    expect(mockStore.setPanelRatio).toHaveBeenCalled()

    // 模擬滑鼠釋放
    fireEvent.mouseUp(document)

    // 驗證游標樣式被重置
    expect(document.body.style.cursor).toBe('')
  })

  it('應該處理雙擊重置功能', async () => {
    const user = userEvent.setup()

    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    const resizer = screen.getByTestId('resizer')

    await user.dblClick(resizer)

    expect(mockStore.resetPanels).toHaveBeenCalled()
  })

  it('應該應用最小寬度限制', () => {
    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
        minPanelWidth={300}
      />
    )

    const leftPanel = screen.getByTestId('left-panel')
    expect(leftPanel).toHaveStyle('min-width: 300px')
  })

  it('應該有正確的無障礙屬性', () => {
    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
      />
    )

    const resizer = screen.getByTestId('resizer')

    expect(resizer).toHaveAttribute('role', 'separator')
    expect(resizer).toHaveAttribute('aria-orientation', 'vertical')
    expect(resizer).toHaveAttribute('aria-label', '調整面板大小')
    expect(resizer).toHaveAttribute('title', '拖拽調整面板大小，雙擊重置')
  })

  it('應該處理拖拽範圍限制', () => {
    render(
      <ResizablePanel
        leftPanel={<LeftPanelContent />}
        rightPanel={<RightPanelContent />}
        minPanelWidth={200}
        maxPanelWidth={0.8}
      />
    )

    const resizer = screen.getByTestId('resizer')

    // 測試超過最大值的情況
    fireEvent.mouseDown(resizer, { clientX: 500 })
    fireEvent.mouseMove(document, { clientX: 900 }) // 90% 比例

    // 應該被限制在 80%
    expect(mockStore.setPanelRatio).toHaveBeenCalledWith(0.8)

    // 測試超過最小值的情況
    fireEvent.mouseMove(document, { clientX: 100 }) // 10% 比例

    // 應該被限制在 20% (200px / 1000px)
    expect(mockStore.setPanelRatio).toHaveBeenCalledWith(0.2)
  })
})
