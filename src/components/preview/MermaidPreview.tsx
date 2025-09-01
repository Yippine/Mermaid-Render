'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { RenderOptions, RenderMetadata } from '@/types/mermaid.types'
import { useMermaidRenderer } from '@/hooks/useMermaidRenderer'
import { InteractiveSVG } from './InteractiveSVG'
import { ErrorDisplay } from './ErrorDisplay'
import { LoadingIndicator } from './LoadingIndicator'
import { cn } from '@/lib/utils'

interface MermaidPreviewProps {
  code: string
  options?: RenderOptions
  className?: string
  debounceMs?: number
  onRenderComplete?: (success: boolean, metadata?: RenderMetadata) => void
}

export const MermaidPreview: React.FC<MermaidPreviewProps> = ({
  code,
  options = {},
  className,
  debounceMs = 300,
  onRenderComplete,
}) => {
  const { renderState, renderResult, render, clearCache, getCacheStats } =
    useMermaidRenderer(debounceMs)

  const [isManuallyRetrying, setIsManuallyRetrying] = useState(false)

  // 當程式碼改變時觸發渲染
  useEffect(() => {
    render(code, options)
  }, [code, options, render])

  // 當渲染完成時通知父組件
  useEffect(() => {
    if (renderState === 'success' || renderState === 'error') {
      onRenderComplete?.(renderState === 'success', renderResult?.metadata)
      setIsManuallyRetrying(false)
    }
  }, [renderState, renderResult, onRenderComplete])

  const handleRetry = useCallback(async () => {
    setIsManuallyRetrying(true)
    clearCache() // 清除快取以強制重新渲染
    await render(code, options)
  }, [code, options, render, clearCache])

  const handleCancelRender = useCallback(() => {
    // Note: 實際實作中可能需要中止渲染請求
    // 這裡只是停止載入狀態顯示
    setIsManuallyRetrying(false)
  }, [])

  if (!code || !code.trim()) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted',
          className
        )}
      >
        <div className='text-center text-muted-foreground space-y-2'>
          <div className='text-4xl'>📊</div>
          <p className='text-sm font-medium'>開始輸入 Mermaid 程式碼</p>
          <p className='text-xs'>您的圖表將在此處即時顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* 載入狀態 */}
      {(renderState === 'loading' || isManuallyRetrying) && (
        <LoadingIndicator
          isLoading={true}
          message={isManuallyRetrying ? '正在重新渲染...' : '正在渲染圖表...'}
          onCancel={handleCancelRender}
          variant='overlay'
        />
      )}

      {/* 錯誤狀態 */}
      {renderState === 'error' && renderResult?.error && (
        <div className='p-6 h-full overflow-auto'>
          <ErrorDisplay
            error={renderResult.error}
            onRetry={handleRetry}
            showCopyButton={true}
          />
        </div>
      )}

      {/* 成功渲染狀態 */}
      {renderState === 'success' && renderResult?.svg && (
        <InteractiveSVG
          svgContent={renderResult.svg}
          className='w-full h-full'
        />
      )}

      {/* 渲染資訊 (開發模式) */}
      {process.env.NODE_ENV === 'development' && renderResult && (
        <div className='absolute bottom-4 right-4 bg-black/50 text-white px-3 py-2 rounded-md text-xs space-y-1'>
          <div>類型: {renderResult.metadata.chartType}</div>
          <div>渲染時間: {renderResult.metadata.renderTime.toFixed(1)}ms</div>
          <div>節點: {renderResult.metadata.nodeCount}</div>
          <div>邊線: {renderResult.metadata.edgeCount}</div>
          <div>快取: {renderResult.fromCache ? '是' : '否'}</div>
        </div>
      )}

      {/* 快取統計 (開發模式) */}
      {process.env.NODE_ENV === 'development' && (
        <div className='absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-md text-xs'>
          <div>快取: {getCacheStats().size} 項目</div>
          <div>命中率: {(getCacheStats().hitRate * 100).toFixed(1)}%</div>
        </div>
      )}
    </div>
  )
}
