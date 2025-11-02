'use client'

import React, { useCallback, useState } from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { SyntaxError, SyntaxErrorType, ParseResult } from '@/lib/syntax/types'

interface ErrorDetectorProps {
  parseResult: ParseResult | null
  onErrorSelect?: (error: SyntaxError) => void
  showSeverityFilter?: boolean
  maxErrorsDisplay?: number
}

interface ErrorStats {
  critical: number
  warnings: number
  info: number
  total: number
}

export const ErrorDetector: React.FC<ErrorDetectorProps> = ({
  parseResult,
  onErrorSelect,
  showSeverityFilter = true,
  maxErrorsDisplay = 10,
}) => {
  const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(
    new Set(['error', 'warning', 'info'])
  )
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())

  // 計算錯誤統計
  const errorStats: ErrorStats = React.useMemo(() => {
    if (!parseResult) {
      return { critical: 0, warnings: 0, info: 0, total: 0 }
    }

    const stats = parseResult.errors.reduce(
      (acc, error) => {
        acc.total++
        switch (error.severity) {
          case 'error':
            acc.critical++
            break
          case 'warning':
            acc.warnings++
            break
          case 'info':
            acc.info++
            break
        }
        return acc
      },
      { critical: 0, warnings: 0, info: 0, total: 0 }
    )

    return stats
  }, [parseResult])

  // 過濾錯誤
  const filteredErrors = React.useMemo(() => {
    if (!parseResult) return []

    return parseResult.errors
      .filter(error => selectedSeverities.has(error.severity))
      .slice(0, maxErrorsDisplay)
  }, [parseResult, selectedSeverities, maxErrorsDisplay])

  const toggleSeverityFilter = useCallback((severity: string) => {
    setSelectedSeverities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(severity)) {
        newSet.delete(severity)
      } else {
        newSet.add(severity)
      }
      return newSet
    })
  }, [])

  const toggleErrorExpansion = useCallback((errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(errorId)) {
        newSet.delete(errorId)
      } else {
        newSet.add(errorId)
      }
      return newSet
    })
  }, [])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className='w-4 h-4 text-red-500' />
      case 'warning':
        return <AlertTriangle className='w-4 h-4 text-yellow-500' />
      case 'info':
        return <Info className='w-4 h-4 text-blue-500' />
      default:
        return <Info className='w-4 h-4 text-gray-500' />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 hover:bg-red-100'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
      case 'info':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100'
    }
  }

  const getErrorTypeDisplayName = (type: SyntaxErrorType): string => {
    const typeNames: Record<SyntaxErrorType, string> = {
      'missing-quotes': '缺少引號',
      'invalid-node-id': '無效節點 ID',
      'inconsistent-arrow': '箭頭不一致',
      'indentation-error': '縮排錯誤',
      'missing-semicolon': '缺少分號',
      'invalid-character': '無效字元',
      'duplicate-node': '重複節點',
      'undefined-node-reference': '未定義節點',
      'version-incompatibility': '版本不相容',
      'malformed-syntax': '語法格式錯誤',
      'unknown-directive': '未知指令',
      'invalid-theme': '無效主題',
      'circular-reference': '循環引用',
    }
    return typeNames[type] || type
  }

  if (!parseResult) {
    return (
      <div className='flex items-center justify-center p-8 text-gray-500'>
        <Info className='w-5 h-5 mr-2' />
        尚未檢測到語法錯誤
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* 錯誤統計摘要 */}
      <div className='flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm'>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <CheckCircle2
              className={`w-5 h-5 ${
                errorStats.total === 0 ? 'text-green-500' : 'text-gray-400'
              }`}
            />
            <span className='font-medium'>
              {errorStats.total === 0
                ? '語法正確'
                : `發現 ${errorStats.total} 個問題`}
            </span>
          </div>

          {errorStats.total > 0 && (
            <div className='flex items-center space-x-4 text-sm'>
              {errorStats.critical > 0 && (
                <span className='flex items-center space-x-1 text-red-600'>
                  <AlertCircle className='w-4 h-4' />
                  <span>{errorStats.critical} 個錯誤</span>
                </span>
              )}
              {errorStats.warnings > 0 && (
                <span className='flex items-center space-x-1 text-yellow-600'>
                  <AlertTriangle className='w-4 h-4' />
                  <span>{errorStats.warnings} 個警告</span>
                </span>
              )}
              {errorStats.info > 0 && (
                <span className='flex items-center space-x-1 text-blue-600'>
                  <Info className='w-4 h-4' />
                  <span>{errorStats.info} 個建議</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* 嚴重程度篩選器 */}
        {showSeverityFilter && errorStats.total > 0 && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-600'>篩選:</span>
            {[
              { key: 'error', label: '錯誤', color: 'text-red-600' },
              { key: 'warning', label: '警告', color: 'text-yellow-600' },
              { key: 'info', label: '建議', color: 'text-blue-600' },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => toggleSeverityFilter(key)}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  selectedSeverities.has(key)
                    ? `${color} bg-white border-current`
                    : 'text-gray-400 bg-gray-50 border-gray-200 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 錯誤列表 */}
      {filteredErrors.length > 0 && (
        <div className='space-y-2'>
          {filteredErrors.map((error, index) => {
            const errorId = `error-${index}`
            const isExpanded = expandedErrors.has(errorId)

            return (
              <div
                key={errorId}
                className={`border rounded-lg transition-colors cursor-pointer ${getSeverityColor(error.severity)}`}
                onClick={() => {
                  toggleErrorExpansion(errorId)
                  onErrorSelect?.(error)
                }}
              >
                <div className='flex items-start justify-between p-3'>
                  <div className='flex items-start space-x-3 flex-1'>
                    {getSeverityIcon(error.severity)}

                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium text-gray-900'>
                          {getErrorTypeDisplayName(error.type)}
                        </span>
                        {error.line && (
                          <span className='text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded'>
                            行 {error.line}
                            {error.column && `:${error.column}`}
                          </span>
                        )}
                        {error.fixable && (
                          <span className='text-xs bg-green-100 text-green-600 px-2 py-1 rounded'>
                            可修復
                          </span>
                        )}
                      </div>

                      <p className='text-sm text-gray-700 mt-1'>
                        {error.message}
                      </p>

                      {isExpanded && error.suggestion && (
                        <div className='mt-2 p-2 bg-white/50 rounded border-l-4 border-gray-300'>
                          <p className='text-sm text-gray-600'>
                            <strong>建議：</strong> {error.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center space-x-2 ml-2'>
                    {error.position && (
                      <span className='text-xs text-gray-500'>
                        位置 {error.position.start}-{error.position.end}
                      </span>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleErrorExpansion(errorId)
                      }}
                      className='text-gray-400 hover:text-gray-600'
                    >
                      <span
                        className={`text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        ▼
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {parseResult.errors.length > maxErrorsDisplay && (
            <div className='text-center p-3 text-gray-500 text-sm'>
              還有 {parseResult.errors.length - maxErrorsDisplay} 個問題未顯示
            </div>
          )}
        </div>
      )}
    </div>
  )
}
