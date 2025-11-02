'use client'

import React, { useCallback, useEffect } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { useMermaidRenderer } from '@/hooks/useMermaidRenderer'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import EmptyState from './EmptyState'
import { InteractiveSVG } from './InteractiveSVG'
import { clsx } from 'clsx'

interface PreviewPanelProps {
  className?: string
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  className = '',
}) => {
  const { code } = useEditorStore()

  // 使用真正的 Mermaid 渲染 Hook
  const {
    renderState,
    renderResult,
    render: renderMermaid,
    clearCache,
  } = useMermaidRenderer(300)

  // 代碼變更時重新渲染
  useEffect(() => {
    if (code.trim()) {
      renderMermaid(code)
    }
  }, [code, renderMermaid])

  // 調試渲染狀態
  useEffect(() => {
    console.log('PreviewPanel - renderState:', renderState)
    console.log('PreviewPanel - renderResult:', renderResult)
    console.log('PreviewPanel - has SVG:', !!renderResult?.svg)
    if (renderResult?.svg) {
      console.log('PreviewPanel - SVG length:', renderResult.svg.length)
    }
  }, [renderState, renderResult])

  const handleRetry = useCallback(() => {
    if (code.trim()) {
      renderMermaid(code)
    }
  }, [code, renderMermaid])

  const handleClearError = useCallback(() => {
    console.log('Clearing error state')
    clearCache()
    // Re-trigger rendering
    if (code.trim()) {
      renderMermaid(code)
    }
  }, [clearCache, code, renderMermaid])

  const handleInsertExample = useCallback(() => {
    const exampleCode = `graph TD
    A[開始] --> B[處理資料]
    B --> C{判斷條件}
    C -->|是| D[執行操作]
    C -->|否| E[跳過操作]
    D --> F[結束]
    E --> F
    
    %% 這是註解
    style A fill:#e1f5fe
    style F fill:#c8e6c9
    style C fill:#fff3e0`

    // 使用 store 來更新代碼
    const { updateCode } = useEditorStore.getState()
    updateCode(exampleCode)
  }, [])

  // 渲染狀態管理
  if (renderState === 'loading') {
    return (
      <div
        className={clsx('flex items-center justify-center h-full', className)}
      >
        <LoadingSpinner size='lg' message='Rendering diagram...' />
      </div>
    )
  }

  if (renderState === 'error' && renderResult?.error) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center h-full p-4',
          className
        )}
      >
        <ErrorMessage
          error={renderResult.error.message}
          onRetry={handleRetry}
          onDismiss={handleClearError}
        />
      </div>
    )
  }

  if (!code.trim()) {
    return (
      <div className={clsx('h-full', className)}>
        <EmptyState
          type='welcome'
          action={{
            label: 'Insert Example Code',
            onClick: handleInsertExample,
          }}
        />
      </div>
    )
  }

  if (!renderResult?.svg) {
    return (
      <div className={clsx('h-full', className)}>
        <EmptyState
          type='empty'
          title='Awaiting Render'
          description='Preparing diagram preview...'
        />
      </div>
    )
  }

  return (
    <div
      className={clsx('h-full overflow-auto bg-background', className)}
      data-testid='preview-panel'
    >
      <div className='h-full p-4'>
        <InteractiveSVG
          svgContent={renderResult.svg}
          className='w-full h-full'
        />
      </div>
    </div>
  )
}

export default PreviewPanel
