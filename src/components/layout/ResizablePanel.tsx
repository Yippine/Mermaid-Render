'use client'

import React, { useCallback, useRef, useEffect, ReactNode } from 'react'
import { useEditorStore } from '@/stores/editorStore'

interface ResizablePanelProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
  className?: string
  minPanelWidth?: number
  maxPanelWidth?: number
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
  className = '',
  minPanelWidth = 200,
  maxPanelWidth = 0.8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startRatio = useRef(0)

  const {
    panelRatio,
    setPanelRatio,
    isEditorCollapsed,
    isPreviewCollapsed,
    resetPanels,
  } = useEditorStore()

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      startX.current = e.clientX
      startRatio.current = panelRatio

      // 改變游標樣式
      document.body.style.cursor = 'col-resize'

      // 新增拖拽時的視覺反饋
      if (resizerRef.current) {
        resizerRef.current.classList.add('bg-blue-500', 'shadow-lg')
      }
    },
    [panelRatio]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const deltaX = e.clientX - startX.current
      const containerWidth = containerRect.width
      const deltaRatio = deltaX / containerWidth

      let newRatio = startRatio.current + deltaRatio

      // 應用最小和最大寬度限制
      const minRatio = minPanelWidth / containerWidth
      const maxRatio =
        typeof maxPanelWidth === 'number' && maxPanelWidth <= 1
          ? maxPanelWidth
          : 1 - minPanelWidth / containerWidth

      newRatio = Math.max(minRatio, Math.min(maxRatio, newRatio))

      setPanelRatio(newRatio)
    },
    [setPanelRatio, minPanelWidth, maxPanelWidth]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return

    isDragging.current = false

    // 恢復游標樣式
    document.body.style.cursor = ''

    // 移除拖拽時的視覺反饋
    if (resizerRef.current) {
      resizerRef.current.classList.remove('bg-blue-500', 'shadow-lg')
    }
  }, [])

  const handleDoubleClick = useCallback(() => {
    resetPanels()
  }, [resetPanels])

  // 事件監聽器設定
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // 鍵盤快速鍵支援
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '\\') {
          e.preventDefault()
          resetPanels()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [resetPanels])

  const leftWidth = isEditorCollapsed
    ? '0%'
    : isPreviewCollapsed
      ? '100%'
      : `${panelRatio * 100}%`

  const rightWidth = isPreviewCollapsed
    ? '0%'
    : isEditorCollapsed
      ? '100%'
      : `${(1 - panelRatio) * 100}%`

  const showResizer = !isEditorCollapsed && !isPreviewCollapsed

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full ${className}`}
      data-testid='resizable-panel-container'
    >
      {/* 左側面板 */}
      <div
        className='relative overflow-hidden transition-all duration-200 ease-in-out'
        style={{
          width: leftWidth,
          minWidth: isEditorCollapsed ? '0px' : `${minPanelWidth}px`,
        }}
        data-testid='left-panel'
      >
        {!isEditorCollapsed && leftPanel}
      </div>

      {/* 可拖拽的分隔線 */}
      {showResizer && (
        <div
          ref={resizerRef}
          className='relative flex-shrink-0 w-1 bg-border hover:bg-blue-400 cursor-col-resize transition-all duration-150 ease-in-out group'
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          data-testid='resizer'
          role='separator'
          aria-orientation='vertical'
          aria-label='調整面板大小'
          title='拖拽調整面板大小，雙擊重置'
        >
          {/* 拖拽提示線 */}
          <div className='absolute inset-y-0 left-1/2 w-0.5 bg-border group-hover:bg-blue-400 transition-colors duration-150' />

          {/* 中央拖拽點 */}
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150'>
            <div className='w-1 h-4 bg-muted-foreground rounded-full' />
          </div>
        </div>
      )}

      {/* 右側面板 */}
      <div
        className='relative overflow-hidden transition-all duration-200 ease-in-out'
        style={{
          width: rightWidth,
          minWidth: isPreviewCollapsed ? '0px' : `${minPanelWidth}px`,
        }}
        data-testid='right-panel'
      >
        {!isPreviewCollapsed && rightPanel}
      </div>
    </div>
  )
}

export default ResizablePanel
