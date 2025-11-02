'use client'

import React, { useEffect, useState } from 'react'
import { EditorLayout } from '@/components/layout/EditorLayout'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { useEditorStore } from '@/stores/editorStore'
import { ErrorDetector } from '@/components/editor/syntax-analyzer/ErrorDetector'
import { SyntaxAnalyzer } from '@/lib/syntax/SyntaxAnalyzer'
import type { ParseResult } from '@/lib/syntax/types'

const INITIAL_CODE = `graph TB
    A[開始] --> B{是否正確?}
    B -->|是| C[結束]
    B -->|否| D[修正]
    D --> A`

export default function EditorPage() {
  const { code, updateCode } = useEditorStore()
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [analyzer] = useState(() => new SyntaxAnalyzer())

  // Initialize with default code if empty
  useEffect(() => {
    if (!code.trim()) {
      updateCode(INITIAL_CODE)
    }
  }, [code, updateCode])

  // Analyze syntax when code changes
  useEffect(() => {
    const analyzeCode = async () => {
      if (code.trim()) {
        try {
          const result = await analyzer.analyze(code)
          setParseResult(result)
        } catch (error) {
          console.error('語法分析錯誤:', error)
          setParseResult(null)
        }
      } else {
        setParseResult(null)
      }
    }

    const timeoutId = setTimeout(analyzeCode, 300) // 防抖
    return () => clearTimeout(timeoutId)
  }, [code, analyzer])

  return (
    <div className='h-screen flex flex-col'>
      <ThemeProvider>
        <EditorLayout
          editorPanel={
            <div className='h-full flex flex-col'>
              <div className='flex-1 overflow-hidden'>
                <CodeEditor className='h-full' />
              </div>
              <div className='h-80 border-t border-border bg-card/30'>
                <ErrorDetector
                  parseResult={parseResult}
                  onErrorSelect={error => {
                    console.log('選中錯誤:', error)
                  }}
                />
              </div>
            </div>
          }
          previewPanel={<PreviewPanel className='h-full' />}
          toolbar={
            <div className='flex items-center space-x-4'>
              <h1 className='text-lg font-semibold text-foreground'>
                Mermaid 編輯器
              </h1>
              <EditorToolbar />
            </div>
          }
        />
      </ThemeProvider>
    </div>
  )
}
