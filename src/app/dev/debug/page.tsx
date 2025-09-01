'use client'

import React, { useState, useEffect } from 'react'

// 最簡單的 Mermaid 測試，繞過我們的 hook
declare global {
  interface Window {
    mermaid: unknown
  }
}

export default function DebugPage() {
  const [code, setCode] = useState(`graph TD
    A[開始] --> B[處理資料]
    B --> C{判斷條件}
    C -->|是| D[執行操作]
    C -->|否| E[跳過操作]
    D --> F[結束]
    E --> F`)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const renderMermaid = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    setError('')
    setSvg('')

    try {
      // 動態載入 mermaid
      const mermaid = await import('mermaid')

      // 初始化 mermaid
      mermaid.default.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })

      // 渲染
      const result = await mermaid.default.render('mermaid-svg', code)
      setSvg(result.svg)
    } catch (err: unknown) {
      console.error('Mermaid render error:', err)
      setError(`渲染錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const handleRender = () => {
    renderMermaid()
  }

  // 初始渲染
  useEffect(() => {
    renderMermaid()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在組件掛載時執行

  return (
    <div className='h-screen flex flex-col p-4'>
      <div className='mb-4'>
        <h1 className='text-2xl font-bold mb-2'>除錯測試頁面</h1>
        <p className='text-gray-600'>直接使用 Mermaid.js 測試渲染功能</p>
        <button
          onClick={handleRender}
          disabled={isLoading}
          className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {isLoading ? '渲染中...' : '手動渲染'}
        </button>
      </div>

      <div className='flex-1 grid grid-cols-2 gap-4'>
        {/* 左側編輯區 */}
        <div className='flex flex-col'>
          <h2 className='font-semibold mb-2'>Mermaid 程式碼</h2>
          <textarea
            value={code}
            onChange={handleCodeChange}
            className='flex-1 p-3 border rounded font-mono text-sm resize-none'
            placeholder='請輸入您的 Mermaid 程式碼...'
          />
        </div>

        {/* 右側預覽區 */}
        <div className='flex flex-col'>
          <h2 className='font-semibold mb-2'>預覽結果</h2>
          <div className='flex-1 border rounded p-4 bg-white overflow-auto'>
            {isLoading && (
              <div className='h-full flex items-center justify-center text-gray-500'>
                渲染中...
              </div>
            )}

            {error && (
              <div className='h-full flex flex-col items-center justify-center text-red-600 space-y-2'>
                <div className='font-semibold'>渲染錯誤</div>
                <div className='text-sm text-center'>{error}</div>
              </div>
            )}

            {svg && !isLoading && !error && (
              <div
                className='h-full flex items-center justify-center'
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}

            {!svg && !isLoading && !error && (
              <div className='h-full flex items-center justify-center text-gray-400'>
                點擊「手動渲染」開始測試
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 除錯資訊 */}
      <div className='mt-4 p-3 bg-gray-50 rounded text-sm'>
        <strong>除錯資訊:</strong>
        程式碼長度: {code.length} 字元 | SVG 長度: {svg.length} 字元 | 狀態:{' '}
        {isLoading ? '渲染中' : error ? '錯誤' : svg ? '成功' : '待渲染'}
      </div>
    </div>
  )
}
