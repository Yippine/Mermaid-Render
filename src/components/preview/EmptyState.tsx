import React from 'react'
import { FileText, Lightbulb, Code } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface EmptyStateProps {
  type?: 'empty' | 'welcome' | 'error'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const getEmptyStateContent = (type: 'empty' | 'welcome' | 'error') => {
  switch (type) {
    case 'welcome':
      return {
        icon: Lightbulb,
        title: '歡迎使用 Mermaid 編輯器',
        description:
          '在左側編輯器中輸入 Mermaid 程式碼，即時預覽將顯示在這裡。',
      }
    case 'error':
      return {
        icon: FileText,
        title: '無法預覽',
        description: '請檢查您的 Mermaid 語法是否正確。',
      }
    default:
      return {
        icon: Code,
        title: '開始創建圖表',
        description: '輸入 Mermaid 程式碼來生成圖表預覽。',
      }
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  description,
  action,
  className = '',
}) => {
  const defaultContent = getEmptyStateContent(type)
  const Icon = defaultContent.icon

  const displayTitle = title || defaultContent.title
  const displayDescription = description || defaultContent.description

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center h-full p-8 text-center',
        className
      )}
      data-testid='empty-state'
    >
      <div className='flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-muted'>
        <Icon className='h-8 w-8 text-muted-foreground' />
      </div>

      <h2 className='text-lg font-medium text-foreground mb-2'>
        {displayTitle}
      </h2>

      <p className='text-sm text-muted-foreground max-w-md mb-6'>
        {displayDescription}
      </p>

      {action && (
        <Button
          variant='default'
          onClick={action.onClick}
          className='flex items-center space-x-2'
        >
          <span>{action.label}</span>
        </Button>
      )}

      {/* 示例代碼提示 */}
      {type === 'welcome' && (
        <div className='mt-8 p-4 bg-muted/50 rounded-lg text-left max-w-sm'>
          <h3 className='text-sm font-medium text-foreground mb-2'>
            試試看這個範例：
          </h3>
          <pre className='text-xs text-muted-foreground font-mono'>
            {`graph TD
    A[開始] --> B[處理]
    B --> C{判斷?}
    C -->|是| D[執行]
    C -->|否| E[跳過]`}
          </pre>
        </div>
      )}
    </div>
  )
}

export default EmptyState
