'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import MonacoEditor, { OnMount, OnChange } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useEditorStore } from '@/stores/editorStore'
import {
  mermaidLanguageConfig,
  mermaidTokensProvider,
  mermaidCompletionProvider,
} from '@/lib/monaco/mermaidLanguage'
import { mermaidDarkTheme, mermaidLightTheme } from '@/lib/monaco/themes'

interface CodeEditorProps {
  className?: string
  height?: string | number
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  className = '',
  height = '100%',
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const { code, theme, updateCode, setError } = useEditorStore()

  const handleEditorDidMount: OnMount = useCallback(
    async (editor, monaco) => {
      editorRef.current = editor

      try {
        // 註冊 Mermaid 語言
        if (
          !monaco.languages.getLanguages().find(lang => lang.id === 'mermaid')
        ) {
          monaco.languages.register({ id: 'mermaid' })
          monaco.languages.setLanguageConfiguration(
            'mermaid',
            mermaidLanguageConfig
          )
          monaco.languages.setMonarchTokensProvider(
            'mermaid',
            mermaidTokensProvider
          )

          // 註冊自動補全提供者
          monaco.languages.registerCompletionItemProvider('mermaid', {
            provideCompletionItems: (model, position) => {
              const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: position.column,
              }

              return {
                suggestions: mermaidCompletionProvider(range),
              }
            },
          })
        }

        // 定義主題
        monaco.editor.defineTheme('mermaid-dark', mermaidDarkTheme)
        monaco.editor.defineTheme('mermaid-light', mermaidLightTheme)

        // 應用主題
        monaco.editor.setTheme(
          theme === 'dark' ? 'mermaid-dark' : 'mermaid-light'
        )

        // 設定編輯器選項
        editor.updateOptions({
          fontSize: 14,
          fontFamily:
            'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          foldingStrategy: 'auto',
          showFoldingControls: 'always',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'top',
        })

        // 快速鍵設定
        editor.addAction({
          id: 'save-content',
          label: 'Save Content',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
          contextMenuGroupId: 'file',
          run: () => {
            // 觸發儲存事件（可以在未來擴充）
            console.log('Content saved:', editor.getValue())
          },
        })

        editor.addAction({
          id: 'format-content',
          label: 'Format Content',
          keybindings: [
            monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
          ],
          contextMenuGroupId: 'edit',
          run: () => {
            editor.getAction('editor.action.formatDocument')?.run()
          },
        })

        // 監聽編輯器焦點事件
        editor.onDidFocusEditorText(() => {
          setError(null)
        })
      } catch (error) {
        console.error('Monaco Editor 初始化失敗:', error)
        setError('編輯器初始化失敗，請重新整理頁面')
      }
    },
    [theme, setError]
  )

  const handleEditorChange: OnChange = useCallback(
    value => {
      if (value !== undefined) {
        updateCode(value)
      }
    },
    [updateCode]
  )

  // 主題變更時更新編輯器主題
  useEffect(() => {
    if (editorRef.current) {
      import('monaco-editor').then(monaco => {
        monaco.editor.setTheme(
          theme === 'dark' ? 'mermaid-dark' : 'mermaid-light'
        )
      })
    }
  }, [theme])

  return (
    <div
      className={`relative ${className}`}
      data-testid='monaco-editor-container'
    >
      <MonacoEditor
        height={height}
        language='mermaid'
        value={code}
        theme={theme === 'dark' ? 'mermaid-dark' : 'mermaid-light'}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          readOnly: false,
          domReadOnly: false,
          contextmenu: true,
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          automaticLayout: true,
        }}
        loading={
          <div className='flex items-center justify-center h-full bg-background text-foreground'>
            <div className='flex flex-col items-center space-y-2'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              <p className='text-sm text-muted-foreground'>載入編輯器...</p>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default CodeEditor
