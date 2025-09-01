'use client'

import React, { useCallback } from 'react'
import {
  Save,
  Undo,
  Redo,
  Search,
  Replace,
  FileText,
  Download,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useEditorStore } from '@/stores/editorStore'
import { clsx } from 'clsx'

interface EditorToolbarProps {
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onFind?: () => void
  onReplace?: () => void
  onFormat?: () => void
  onExport?: () => void
  onSettings?: () => void
  className?: string
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSave,
  onUndo,
  onRedo,
  onFind,
  onReplace,
  onFormat,
  onExport,
  onSettings,
  className = '',
}) => {
  const { code } = useEditorStore()

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave()
    } else {
      // 預設儲存行為
      console.log('儲存內容:', code)

      // 觸發瀏覽器下載
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mermaid-diagram.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [onSave, code])

  const handleUndo = useCallback(() => {
    if (onUndo) {
      onUndo()
    } else {
      // 透過快速鍵觸發復原
      document.execCommand('undo')
    }
  }, [onUndo])

  const handleRedo = useCallback(() => {
    if (onRedo) {
      onRedo()
    } else {
      // 透過快速鍵觸發重做
      document.execCommand('redo')
    }
  }, [onRedo])

  const handleFind = useCallback(() => {
    if (onFind) {
      onFind()
    } else {
      // 觸發瀏覽器尋找功能
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)
    }
  }, [onFind])

  const handleReplace = useCallback(() => {
    if (onReplace) {
      onReplace()
    } else {
      // 觸發瀏覽器取代功能
      const event = new KeyboardEvent('keydown', {
        key: 'h',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)
    }
  }, [onReplace])

  const handleFormat = useCallback(() => {
    if (onFormat) {
      onFormat()
    } else {
      console.log('格式化程式碼')
    }
  }, [onFormat])

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport()
    } else {
      console.log('匯出圖表')
    }
  }, [onExport])

  const handleSettings = useCallback(() => {
    if (onSettings) {
      onSettings()
    } else {
      console.log('開啟設定')
    }
  }, [onSettings])

  return (
    <div
      className={clsx(
        'flex items-center justify-between bg-muted/30 border-b px-4 py-2',
        className
      )}
    >
      {/* 左側功能按鈕 */}
      <div className='flex items-center space-x-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleSave}
          className='flex items-center space-x-1'
          title='儲存 (Ctrl+S)'
          data-testid='save-btn'
        >
          <Save className='h-4 w-4' />
          <span className='hidden sm:inline'>儲存</span>
        </Button>

        <div className='w-px h-6 bg-border mx-1' />

        <Button
          variant='ghost'
          size='sm'
          onClick={handleUndo}
          title='復原 (Ctrl+Z)'
          data-testid='undo-btn'
        >
          <Undo className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={handleRedo}
          title='重做 (Ctrl+Y)'
          data-testid='redo-btn'
        >
          <Redo className='h-4 w-4' />
        </Button>

        <div className='w-px h-6 bg-border mx-1' />

        <Button
          variant='ghost'
          size='sm'
          onClick={handleFind}
          title='尋找 (Ctrl+F)'
          data-testid='find-btn'
        >
          <Search className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={handleReplace}
          title='取代 (Ctrl+H)'
          data-testid='replace-btn'
        >
          <Replace className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={handleFormat}
          title='格式化程式碼'
          data-testid='format-btn'
        >
          <FileText className='h-4 w-4' />
        </Button>
      </div>

      {/* 右側設定按鈕 */}
      <div className='flex items-center space-x-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleExport}
          title='匯出圖表'
          data-testid='export-btn'
          className='hidden sm:flex items-center space-x-1'
        >
          <Download className='h-4 w-4' />
          <span>匯出</span>
        </Button>

        <ThemeToggle />

        <Button
          variant='ghost'
          size='sm'
          onClick={handleSettings}
          title='設定'
          data-testid='settings-btn'
        >
          <Settings className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

export default EditorToolbar
