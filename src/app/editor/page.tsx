'use client'

import React, { useCallback, useRef } from 'react'
import { EditorLayout } from '@/components/layout/EditorLayout'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { useEditorStore } from '@/stores/editorStore'
import type { editor } from 'monaco-editor'

export default function EditorPage() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { updateCode } = useEditorStore()

  // 編輯器事件處理
  const handleSave = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.getValue()
      console.log('儲存內容:', content)

      // 模擬儲存到伺服器
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mermaid-diagram-${new Date().getTime()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [])

  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', {})
    }
  }, [])

  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', {})
    }
  }, [])

  const handleFind = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'actions.find', {})
    }
  }, [])

  const handleReplace = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger(
        'keyboard',
        'editor.action.startFindReplaceAction',
        {}
      )
    }
  }, [])

  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.formatDocument', {})
    }
  }, [])

  const handleExport = useCallback(() => {
    console.log('匯出功能 - 將在後續版本實作')
  }, [])

  const handleSettings = useCallback(() => {
    console.log('設定功能 - 將在後續版本實作')
  }, [])

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

    updateCode(exampleCode)
  }, [updateCode])

  // 編輯器實例設定
  const handleEditorMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor) => {
      editorRef.current = editorInstance

      // 設定額外的快速鍵
      editorInstance.addAction({
        id: 'insert-example',
        label: '插入範例程式碼',
        keybindings: [2048 | 2 | 69], // Ctrl+Shift+E
        run: handleInsertExample,
      })
    },
    [handleInsertExample]
  )

  return (
    <ThemeProvider>
      <div className='h-screen w-full overflow-hidden bg-background text-foreground'>
        <EditorLayout
          toolbar={
            <EditorToolbar
              onSave={handleSave}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onFind={handleFind}
              onReplace={handleReplace}
              onFormat={handleFormat}
              onExport={handleExport}
              onSettings={handleSettings}
            />
          }
          editorPanel={
            <div className='h-full' onLoad={() => handleEditorMount}>
              <CodeEditor className='h-full' height='100%' />
            </div>
          }
          previewPanel={<PreviewPanel className='h-full' />}
        />
      </div>
    </ThemeProvider>
  )
}
