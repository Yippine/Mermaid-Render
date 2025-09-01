'use client'

import React, { useCallback, useRef, useEffect, useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import EmptyState from './EmptyState'
import { clsx } from 'clsx'

interface PreviewPanelProps {
  className?: string
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  className = '',
}) => {
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewContent, setPreviewContent] = useState<string>('')

  const { code, isLoading, error, setLoading, setError } = useEditorStore()

  const renderMermaid = useCallback(async () => {
    if (!code.trim()) {
      setPreviewContent('')
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // TODO: 之後整合真正的 Mermaid 渲染邏輯
      // 這裡先用模擬的方式來展示基礎架構
      await new Promise(resolve => setTimeout(resolve, 500)) // 模擬渲染延遲

      // 模擬渲染結果
      const mockSvg = `
        <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .node { fill: #f9f9f9; stroke: #333; stroke-width: 1.5px; }
              .edge { stroke: #333; stroke-width: 1.5px; fill: none; }
              .text { font-family: 'Arial', sans-serif; font-size: 14px; text-anchor: middle; }
              .arrow { fill: #333; }
            </style>
          </defs>
          
          <!-- 節點 -->
          <rect x="50" y="50" width="80" height="40" rx="5" class="node"/>
          <text x="90" y="75" class="text">開始</text>
          
          <rect x="160" y="130" width="80" height="40" rx="5" class="node"/>
          <text x="200" y="155" class="text">處理</text>
          
          <polygon points="270,180 320,200 270,220 220,200" class="node"/>
          <text x="270" y="205" class="text">判斷?</text>
          
          <!-- 箭頭 -->
          <path d="M 90 90 L 90 110 L 200 110 L 200 130" class="edge"/>
          <polygon points="200,130 195,125 205,125" class="arrow"/>
          
          <path d="M 240 150 L 270 150 L 270 180" class="edge"/>
          <polygon points="270,180 265,175 275,175" class="arrow"/>
          
          <!-- 示例文字 -->
          <text x="200" y="280" class="text" style="font-size: 12px; fill: #666;">
            預覽模式：${code.split('\n')[0] || '空白圖表'}
          </text>
        </svg>
      `

      setPreviewContent(mockSvg)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '渲染失敗'
      setError(`Mermaid 渲染錯誤: ${errorMessage}`)
      setPreviewContent('')
    } finally {
      setLoading(false)
    }
  }, [code, setLoading, setError])

  // 代碼變更時重新渲染
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      renderMermaid()
    }, 300) // 300ms 防抖

    return () => clearTimeout(debounceTimer)
  }, [renderMermaid])

  const handleRetry = useCallback(() => {
    renderMermaid()
  }, [renderMermaid])

  const handleClearError = useCallback(() => {
    setError(null)
  }, [setError])

  const handleInsertExample = useCallback(() => {
    // 這將由父組件處理，這裡先留空
    console.log('插入範例程式碼')
  }, [])

  // 渲染狀態管理
  if (isLoading) {
    return (
      <div
        className={clsx('flex items-center justify-center h-full', className)}
      >
        <LoadingSpinner size='lg' message='正在渲染圖表...' />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center h-full p-4',
          className
        )}
      >
        <ErrorMessage
          error={error}
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

  if (!previewContent) {
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
        <div
          ref={previewRef}
          className='max-w-full max-h-full'
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </div>
    </div>
  )
}

export default PreviewPanel
