import React from 'react'
import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  message = '載入中...',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={clsx('flex flex-col items-center justify-center', className)}
      data-testid='loading-spinner'
    >
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-muted-foreground border-t-transparent',
          sizeClasses[size]
        )}
        role='status'
        aria-label='載入中'
      />
      {message && (
        <p className='mt-2 text-sm text-muted-foreground' aria-live='polite'>
          {message}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
