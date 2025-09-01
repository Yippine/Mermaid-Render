'use client'

import React from 'react'
import { AlertCircle, Copy, RefreshCw } from 'lucide-react'
import { MermaidError } from '@/types/mermaid.types'
import { cn } from '@/lib/utils'

interface ErrorDisplayProps {
  error: MermaidError
  className?: string
  onRetry?: () => void
  showCopyButton?: boolean
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  className,
  onRetry,
  showCopyButton = true,
}) => {
  const handleCopyError = async () => {
    const errorText =
      `錯誤訊息: ${error.message}\n` +
      (error.line
        ? `行號: ${error.line}${error.column ? `:${error.column}` : ''}\n`
        : '') +
      (error.suggestion ? `建議: ${error.suggestion}\n` : '')

    try {
      await navigator.clipboard.writeText(errorText)
      // TODO: Add toast notification
      console.log('錯誤資訊已複製到剪貼板')
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  return (
    <div
      className={cn(
        'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6',
        className
      )}
    >
      <div className='flex items-start space-x-3'>
        <AlertCircle className='h-5 w-5 text-red-500 mt-0.5 flex-shrink-0' />

        <div className='flex-1 min-w-0'>
          <h3 className='font-medium text-red-800 dark:text-red-300 mb-2'>
            語法錯誤
          </h3>

          <p className='text-red-700 dark:text-red-400 mb-3 break-words'>
            {error.message}
          </p>

          {error.line && (
            <div className='mb-3'>
              <p className='text-sm text-red-600 dark:text-red-500 font-mono'>
                📍 行 {error.line}
                {error.column && `:${error.column}`}
              </p>
            </div>
          )}

          {error.suggestion && (
            <div className='mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700'>
              <p className='text-sm text-red-800 dark:text-red-300'>
                <span className='font-medium'>💡 建議:</span> {error.suggestion}
              </p>
            </div>
          )}

          <div className='flex items-center gap-2 mt-4'>
            {onRetry && (
              <button
                onClick={onRetry}
                className='inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 text-red-800 dark:text-red-300 rounded-md transition-colors'
              >
                <RefreshCw className='h-4 w-4' />
                重新渲染
              </button>
            )}

            {showCopyButton && (
              <button
                onClick={handleCopyError}
                className='inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 text-red-800 dark:text-red-300 rounded-md transition-colors'
              >
                <Copy className='h-4 w-4' />
                複製錯誤
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
