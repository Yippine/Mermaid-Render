'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingIndicatorProps {
  isLoading: boolean
  progress?: number
  elapsed?: number
  onCancel?: () => void
  className?: string
  variant?: 'overlay' | 'inline'
  message?: string
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isLoading,
  progress,
  elapsed,
  onCancel,
  className,
  variant = 'overlay',
  message = '正在渲染圖表...',
}) => {
  const [internalElapsed, setInternalElapsed] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setInternalElapsed(0)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      setInternalElapsed(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading])

  const displayElapsed = elapsed ?? internalElapsed
  const elapsedSeconds = (displayElapsed / 1000).toFixed(1)

  if (!isLoading) return null

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-4 bg-muted/50 rounded-lg border',
          className
        )}
      >
        <Loader2 className='h-5 w-5 animate-spin text-primary flex-shrink-0' />

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <span className='text-sm font-medium'>{message}</span>
            {displayElapsed > 0 && (
              <span className='text-xs text-muted-foreground font-mono'>
                {elapsedSeconds}s
              </span>
            )}
          </div>

          {progress !== undefined && (
            <div className='w-full bg-muted rounded-full h-2'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-300 ease-out'
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className='p-1 hover:bg-muted rounded-md transition-colors'
            aria-label='取消渲染'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>
    )
  }

  // Overlay variant
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        'bg-background/80 backdrop-blur-sm',
        'z-10',
        className
      )}
    >
      <div className='text-center space-y-4 p-6 bg-card border rounded-lg shadow-lg max-w-sm w-full mx-4'>
        <div className='relative'>
          <Loader2 className='h-12 w-12 animate-spin mx-auto text-primary' />

          {progress !== undefined && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-xs font-mono text-primary font-bold'>
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <p className='text-sm font-medium'>{message}</p>

          {displayElapsed > 0 && (
            <p className='text-xs text-muted-foreground font-mono'>
              已耗時 {elapsedSeconds} 秒
            </p>
          )}
        </div>

        {progress !== undefined && (
          <div className='w-full bg-muted rounded-full h-2'>
            <div
              className='bg-primary h-2 rounded-full transition-all duration-300 ease-out'
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className='inline-flex items-center gap-2 px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors w-full justify-center'
          >
            <X className='h-4 w-4' />
            取消渲染
          </button>
        )}

        {/* 提示文字 */}
        <p className='text-xs text-muted-foreground'>
          大型圖表可能需要較長時間處理
        </p>
      </div>
    </div>
  )
}
