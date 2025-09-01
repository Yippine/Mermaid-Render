import React from 'react'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface ErrorMessageProps {
  error: string | Error
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'default' | 'compact'
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  variant = 'default',
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message
  const isCompact = variant === 'compact'

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-6 text-center',
        'bg-destructive/10 border border-destructive/20 rounded-lg',
        isCompact && 'p-4',
        className
      )}
      data-testid='error-message'
      role='alert'
      aria-live='assertive'
    >
      <div className='flex items-center space-x-2 mb-4'>
        <AlertCircle
          className={clsx(
            'text-destructive',
            isCompact ? 'h-4 w-4' : 'h-6 w-6'
          )}
        />
        <h3
          className={clsx(
            'font-medium text-destructive',
            isCompact ? 'text-sm' : 'text-base'
          )}
        >
          發生錯誤
        </h3>
        {onDismiss && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onDismiss}
            className='ml-auto p-1 h-auto text-muted-foreground hover:text-foreground'
            aria-label='關閉錯誤訊息'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      <p
        className={clsx(
          'text-muted-foreground mb-4',
          isCompact ? 'text-xs' : 'text-sm'
        )}
      >
        {errorMessage}
      </p>

      {onRetry && (
        <Button
          variant='outline'
          size={isCompact ? 'sm' : 'default'}
          onClick={onRetry}
          className='flex items-center space-x-2'
        >
          <RefreshCw className={clsx(isCompact ? 'h-3 w-3' : 'h-4 w-4')} />
          <span>重試</span>
        </Button>
      )}
    </div>
  )
}

export default ErrorMessage
