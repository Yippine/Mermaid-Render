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

  const handleRetry = useCallback(() => {
    if (code.trim()) {
      renderMermaid(code)
    }
  }, [code, renderMermaid])

  const handleClearError = useCallback(() => {
    clearCache()
  }, [clearCache])

  const handleInsertExample = useCallback(() => {
    // 這將由父組件處理，這裡先留空
    console.log('插入範例程式碼')
  }, [])

  // 渲染狀態管理
  if (renderState === 'loading') {
    return (
      <div
        className={clsx('flex items-center justify-center h-full', className)}
      >
        <LoadingSpinner size='lg' message='正在渲染圖表...' />
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
            label: '插入範例程式碼',
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
          title='等待渲染'
          description='正在準備圖表預覽...'
        />
      </div>
    )
  }

  return (
    <div
      className={clsx('h-full overflow-auto bg-background', className)}
      data-testid='preview-panel'
    >
      <div className='flex items-center justify-center min-h-full p-4'>
        <InteractiveSVG
          svgContent={renderResult.svg}
          className='max-w-full max-h-full'
        />
      </div>
    </div>
  )
}

export default PreviewPanel
