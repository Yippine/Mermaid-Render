'use client'

import React, { useState, useCallback } from 'react'
import { Wand2, X, ArrowRight, Eye } from 'lucide-react'
import { ParseResult, SyntaxFix } from '@/lib/syntax/types'

interface SyntaxFixerProps {
  parseResult: ParseResult | null
  onApplyFixes?: (fixes: SyntaxFix[]) => void
  onPreviewFix?: (fix: SyntaxFix) => void
  showConfidence?: boolean
  minConfidence?: number
}

interface FixGroup {
  type: string
  fixes: SyntaxFix[]
  selected: boolean
}

export const SyntaxFixer: React.FC<SyntaxFixerProps> = ({
  parseResult,
  onApplyFixes,
  onPreviewFix,
  showConfidence = true,
  minConfidence = 0.5,
}) => {
  const [selectedFixes, setSelectedFixes] = useState<Set<number>>(new Set())
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [previewedFix, setPreviewedFix] = useState<SyntaxFix | null>(null)

  // 將修復按類型分組
  const fixGroups: FixGroup[] = React.useMemo(() => {
    if (!parseResult?.fixes) return []

    const groups = new Map<string, SyntaxFix[]>()

    parseResult.fixes
      .filter(fix => fix.confidence >= minConfidence)
      .forEach(fix => {
        const key = fix.type
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(fix)
      })

    return Array.from(groups.entries()).map(([type, fixes]) => ({
      type,
      fixes,
      selected: true,
    }))
  }, [parseResult, minConfidence])

  // 取得可應用的修復
  const applicableFixes = React.useMemo(() => {
    return fixGroups.flatMap((group, groupIndex) =>
      group.selected
        ? group.fixes.map((fix, fixIndex) => ({
            ...fix,
            index: groupIndex * 1000 + fixIndex,
          }))
        : []
    )
  }, [fixGroups])

  const toggleFixSelection = useCallback((fixIndex: number) => {
    setSelectedFixes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fixIndex)) {
        newSet.delete(fixIndex)
      } else {
        newSet.add(fixIndex)
      }
      return newSet
    })
  }, [])

  const toggleGroupSelection = useCallback((groupType: string) => {
    // 這個功能需要重構狀態管理
    console.log('Toggle group:', groupType)
  }, [])

  const selectAllFixes = useCallback(() => {
    const allIndexes = applicableFixes.map(fix => fix.index)
    setSelectedFixes(new Set(allIndexes))
  }, [applicableFixes])

  const clearAllSelections = useCallback(() => {
    setSelectedFixes(new Set())
  }, [])

  const handleApplySelected = useCallback(() => {
    const selectedFixList = applicableFixes.filter(fix =>
      selectedFixes.has(fix.index)
    )
    onApplyFixes?.(selectedFixList)
  }, [applicableFixes, selectedFixes, onApplyFixes])

  const handlePreviewFix = useCallback(
    (fix: SyntaxFix) => {
      setPreviewedFix(fix)
      setShowPreview(true)
      onPreviewFix?.(fix)
    },
    [onPreviewFix]
  )

  const getFixTypeDisplayName = (type: string): string => {
    const typeNames: Record<string, string> = {
      'add-quotes': '添加引號',
      'fix-node-id': '修復節點 ID',
      'standardize-arrow': '統一箭頭',
      'fix-indentation': '修復縮排',
      'add-semicolon': '添加分號',
      'remove-invalid-character': '移除無效字元',
      'rename-duplicate-node': '重新命名節點',
      'add-node-definition': '添加節點定義',
      'convert-version-syntax': '轉換版本語法',
      'fix-malformed-syntax': '修復語法格式',
      'remove-unknown-directive': '移除未知指令',
      'fix-theme-reference': '修復主題引用',
      'resolve-circular-reference': '解決循環引用',
    }
    return typeNames[type] || type
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return '高'
    if (confidence >= 0.6) return '中'
    return '低'
  }

  if (!parseResult || !parseResult.fixes || parseResult.fixes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-gray-500'>
        <Wand2 className='w-8 h-8 mb-2' />
        <span>沒有可應用的修復建議</span>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* 標題和操作按鈕 */}
      <div className='flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm'>
        <div className='flex items-center space-x-2'>
          <Wand2 className='w-5 h-5 text-blue-500' />
          <h3 className='font-medium'>
            找到 {parseResult.fixes.length} 個修復建議
          </h3>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={selectAllFixes}
            className='px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
          >
            全選
          </button>
          <button
            onClick={clearAllSelections}
            className='px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors'
          >
            清除
          </button>
          <button
            onClick={handleApplySelected}
            disabled={selectedFixes.size === 0}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
          >
            <Wand2 className='w-4 h-4' />
            <span>套用選中的修復 ({selectedFixes.size})</span>
          </button>
        </div>
      </div>

      {/* 修復列表 */}
      <div className='space-y-3'>
        {fixGroups.map((group, groupIndex) => (
          <div
            key={group.type}
            className='border rounded-lg bg-white shadow-sm'
          >
            <div className='flex items-center justify-between p-3 border-b bg-gray-50'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  checked={group.selected}
                  onChange={() => toggleGroupSelection(group.type)}
                  className='rounded text-blue-500 focus:ring-blue-500'
                />
                <span className='font-medium'>
                  {getFixTypeDisplayName(group.type)} ({group.fixes.length})
                </span>
              </div>
            </div>

            <div className='space-y-2 p-3'>
              {group.fixes.map((fix, fixIndex) => {
                const globalIndex = groupIndex * 1000 + fixIndex
                const isSelected = selectedFixes.has(globalIndex)

                return (
                  <div
                    key={fixIndex}
                    className={`border rounded-md p-3 transition-colors ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-3 flex-1'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleFixSelection(globalIndex)}
                          className='mt-1 rounded text-blue-500 focus:ring-blue-500'
                        />

                        <div className='flex-1'>
                          <p className='text-sm text-gray-700 mb-2'>
                            {fix.description}
                          </p>

                          {/* 修復預覽 */}
                          <div className='flex items-center space-x-2 text-xs'>
                            <span className='text-gray-500'>修復:</span>
                            <code className='bg-red-100 text-red-700 px-2 py-1 rounded'>
                              {fix.original || '(空白)'}
                            </code>
                            <ArrowRight className='w-3 h-3 text-gray-400' />
                            <code className='bg-green-100 text-green-700 px-2 py-1 rounded'>
                              {fix.fixed || '(移除)'}
                            </code>
                          </div>

                          {/* 位置資訊 */}
                          {fix.position && (
                            <div className='text-xs text-gray-500 mt-1'>
                              位置: {fix.position.start}-{fix.position.end}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center space-x-2 ml-3'>
                        {/* 信心度指示器 */}
                        {showConfidence && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(fix.confidence)}`}
                          >
                            {getConfidenceLabel(fix.confidence)} (
                            {Math.round(fix.confidence * 100)}%)
                          </span>
                        )}

                        {/* 預覽按鈕 */}
                        <button
                          onClick={() => handlePreviewFix(fix)}
                          className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
                          title='預覽修復效果'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 修復預覽模態框 */}
      {showPreview && previewedFix && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-medium'>修復預覽</h3>
              <button
                onClick={() => setShowPreview(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  修復描述:
                </h4>
                <p className='text-sm text-gray-600'>
                  {previewedFix.description}
                </p>
              </div>

              <div>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  修復內容:
                </h4>
                <div className='bg-gray-100 rounded-md p-3 space-y-2'>
                  <div>
                    <span className='text-xs text-red-600'>原始:</span>
                    <code className='block bg-red-50 border border-red-200 p-2 rounded text-sm'>
                      {previewedFix.original || '(空白)'}
                    </code>
                  </div>
                  <div>
                    <span className='text-xs text-green-600'>修復後:</span>
                    <code className='block bg-green-50 border border-green-200 p-2 rounded text-sm'>
                      {previewedFix.fixed || '(移除)'}
                    </code>
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between pt-4 border-t'>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${getConfidenceColor(previewedFix.confidence)}`}
                >
                  信心度: {Math.round(previewedFix.confidence * 100)}%
                </span>

                <div className='space-x-2'>
                  <button
                    onClick={() => setShowPreview(false)}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors'
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      onApplyFixes?.([previewedFix])
                      setShowPreview(false)
                    }}
                    className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
                  >
                    套用此修復
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
