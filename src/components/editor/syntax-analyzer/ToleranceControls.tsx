'use client'

import React, { useState, useCallback } from 'react'
import {
  Settings,
  Shield,
  AlertTriangle,
  Zap,
  ToggleLeft,
  ToggleRight,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react'
import {
  ToleranceConfig,
  ToleranceLevel,
  SyntaxErrorType,
  CustomRule,
} from '@/lib/syntax/types'

interface ToleranceControlsProps {
  config: ToleranceConfig
  onChange: (config: ToleranceConfig) => void
  onReset?: () => void
  className?: string
}

const TOLERANCE_LEVELS: Array<{
  value: ToleranceLevel
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    value: 'strict',
    label: 'Strict',
    description: 'Only allow completely correct syntax, report all issues',
    icon: <Shield className='w-4 h-4' />,
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Allow common syntax variants, auto-fix basic issues',
    icon: <AlertTriangle className='w-4 h-4' />,
  },
  {
    value: 'relaxed',
    label: 'Relaxed',
    description: 'Maximum tolerance for syntax errors, aggressively fix issues',
    icon: <Zap className='w-4 h-4' />,
  },
]

const ERROR_TYPES: Array<{
  value: SyntaxErrorType
  label: string
  description: string
}> = [
  {
    value: 'missing-quotes',
    label: 'Missing Quotes',
    description: 'Node labels missing quotes',
  },
  {
    value: 'invalid-node-id',
    label: 'Invalid Node ID',
    description: 'Node ID format is incorrect',
  },
  {
    value: 'inconsistent-arrow',
    label: 'Inconsistent Arrow',
    description: 'Mixed different arrow styles',
  },
  {
    value: 'indentation-error',
    label: 'Indentation Error',
    description: 'Code indentation is inconsistent',
  },
  {
    value: 'missing-semicolon',
    label: 'Missing Semicolon',
    description: 'Statement missing semicolon at end',
  },
  {
    value: 'invalid-character',
    label: 'Invalid Character',
    description: 'Contains unsupported characters',
  },
  {
    value: 'duplicate-node',
    label: 'Duplicate Node',
    description: 'Node ID defined multiple times',
  },
  {
    value: 'undefined-node-reference',
    label: 'Undefined Node',
    description: 'References undefined node',
  },
  {
    value: 'version-incompatibility',
    label: 'Version Incompatibility',
    description: 'Mermaid version syntax conflict',
  },
]

export const ToleranceControls: React.FC<ToleranceControlsProps> = ({
  config,
  onChange,
  onReset,
  className = '',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newCustomRule, setNewCustomRule] = useState<Partial<CustomRule>>({
    name: '',
    pattern: '',
    replacement: '',
    description: '',
    priority: 1,
    enabled: true,
  })

  const handleLevelChange = useCallback(
    (level: ToleranceLevel) => {
      onChange({ ...config, level })
    },
    [config, onChange]
  )

  const toggleAutoFix = useCallback(() => {
    onChange({ ...config, enableAutoFix: !config.enableAutoFix })
  }, [config, onChange])

  const toggleVersionCompatibility = useCallback(() => {
    onChange({
      ...config,
      enableVersionCompatibility: !config.enableVersionCompatibility,
    })
  }, [config, onChange])

  const toggleIgnoredError = useCallback(
    (errorType: SyntaxErrorType) => {
      const ignoredErrors = [...config.ignoredErrors]
      const index = ignoredErrors.indexOf(errorType)

      if (index > -1) {
        ignoredErrors.splice(index, 1)
      } else {
        ignoredErrors.push(errorType)
      }

      onChange({ ...config, ignoredErrors })
    },
    [config, onChange]
  )

  const addCustomRule = useCallback(() => {
    if (
      !newCustomRule.name ||
      !newCustomRule.pattern ||
      !newCustomRule.replacement
    ) {
      return
    }

    const rule: CustomRule = {
      id: `custom-${Date.now()}`,
      name: newCustomRule.name,
      pattern: newCustomRule.pattern,
      replacement: newCustomRule.replacement,
      description: newCustomRule.description || '',
      priority: newCustomRule.priority || 1,
      enabled: true,
    }

    onChange({
      ...config,
      customRules: [...config.customRules, rule],
    })

    setNewCustomRule({
      name: '',
      pattern: '',
      replacement: '',
      description: '',
      priority: 1,
      enabled: true,
    })
  }, [config, onChange, newCustomRule])

  const removeCustomRule = useCallback(
    (ruleId: string) => {
      onChange({
        ...config,
        customRules: config.customRules.filter(rule => rule.id !== ruleId),
      })
    },
    [config, onChange]
  )

  const toggleCustomRule = useCallback(
    (ruleId: string) => {
      onChange({
        ...config,
        customRules: config.customRules.map(rule =>
          rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        ),
      })
    },
    [config, onChange]
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Settings className='w-5 h-5 text-gray-600' />
          <h3 className='text-base font-medium'>Tolerance Settings</h3>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className='flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors'
          >
            <RotateCcw className='w-4 h-4' />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Tolerance Level */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-gray-700'>
          Tolerance Level
        </label>
        <div className='grid grid-cols-1 gap-2'>
          {TOLERANCE_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => handleLevelChange(level.value)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                config.level === level.value
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className='flex items-center space-x-2'>
                <span
                  className={
                    config.level === level.value
                      ? 'text-blue-500'
                      : 'text-gray-500'
                  }
                >
                  {level.icon}
                </span>
                <span className='font-medium'>{level.label}</span>
              </div>
              <p className='text-sm text-gray-600 mt-1'>{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Options */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium text-gray-700'>Feature Options</h4>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <label className='text-sm font-medium text-gray-700'>
                Auto Fix
              </label>
              <p className='text-sm text-gray-500'>
                Automatically fix repairable syntax errors
              </p>
            </div>
            <button
              onClick={toggleAutoFix}
              className={`flex items-center space-x-1 ${
                config.enableAutoFix ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {config.enableAutoFix ? (
                <ToggleRight className='w-6 h-6' />
              ) : (
                <ToggleLeft className='w-6 h-6' />
              )}
            </button>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <label className='text-sm font-medium text-gray-700'>
                Version Compatibility
              </label>
              <p className='text-sm text-gray-500'>
                Check and convert different Mermaid version syntax
              </p>
            </div>
            <button
              onClick={toggleVersionCompatibility}
              className={`flex items-center space-x-1 ${
                config.enableVersionCompatibility
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              {config.enableVersionCompatibility ? (
                <ToggleRight className='w-6 h-6' />
              ) : (
                <ToggleLeft className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700'
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
          <span
            className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className='space-y-6 border-t pt-6'>
          {/* Ignored Error Types */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-700'>
              Ignored Error Types
            </label>
            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {ERROR_TYPES.map(errorType => (
                <div
                  key={errorType.value}
                  className='flex items-center justify-between p-2 border rounded hover:bg-gray-50'
                >
                  <div>
                    <span className='text-sm font-medium'>
                      {errorType.label}
                    </span>
                    <p className='text-xs text-gray-500'>
                      {errorType.description}
                    </p>
                  </div>
                  <input
                    type='checkbox'
                    checked={config.ignoredErrors.includes(errorType.value)}
                    onChange={() => toggleIgnoredError(errorType.value)}
                    className='rounded text-blue-500 focus:ring-blue-500'
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Custom Rules */}
          <div className='space-y-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Custom Repair Rules
            </label>

            {/* 現有自訂規則 */}
            {config.customRules.length > 0 && (
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {config.customRules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-3 border rounded-lg ${
                      rule.enabled
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm font-medium'>
                            {rule.name}
                          </span>
                          <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                            優先級 {rule.priority}
                          </span>
                        </div>
                        {rule.description && (
                          <p className='text-xs text-gray-500 mt-1'>
                            {rule.description}
                          </p>
                        )}
                        <div className='text-xs text-gray-400 mt-1'>
                          <code>{rule.pattern.toString()}</code> →{' '}
                          <code>{rule.replacement}</code>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2 ml-2'>
                        <button
                          onClick={() => toggleCustomRule(rule.id)}
                          className={`text-sm ${
                            rule.enabled ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          {rule.enabled ? (
                            <ToggleRight className='w-5 h-5' />
                          ) : (
                            <ToggleLeft className='w-5 h-5' />
                          )}
                        </button>
                        <button
                          onClick={() => removeCustomRule(rule.id)}
                          className='text-red-500 hover:text-red-700'
                        >
                          <Minus className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 新增自訂規則表單 */}
            <div className='p-4 border-2 border-dashed border-gray-200 rounded-lg space-y-3'>
              <h5 className='text-sm font-medium text-gray-700'>
                新增自訂規則
              </h5>

              <div className='grid grid-cols-1 gap-3'>
                <input
                  type='text'
                  placeholder='規則名稱'
                  value={newCustomRule.name || ''}
                  onChange={e =>
                    setNewCustomRule({ ...newCustomRule, name: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
                />

                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='text'
                    placeholder='匹配模式 (RegExp)'
                    value={
                      typeof newCustomRule.pattern === 'string'
                        ? newCustomRule.pattern
                        : ''
                    }
                    onChange={e =>
                      setNewCustomRule({
                        ...newCustomRule,
                        pattern: e.target.value,
                      })
                    }
                    className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
                  />
                  <input
                    type='text'
                    placeholder='替換文字'
                    value={newCustomRule.replacement || ''}
                    onChange={e =>
                      setNewCustomRule({
                        ...newCustomRule,
                        replacement: e.target.value,
                      })
                    }
                    className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <textarea
                  placeholder='規則描述（可選）'
                  value={newCustomRule.description || ''}
                  onChange={e =>
                    setNewCustomRule({
                      ...newCustomRule,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-none'
                />

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <label className='text-sm text-gray-600'>優先級:</label>
                    <input
                      type='number'
                      min='1'
                      max='10'
                      value={newCustomRule.priority || 1}
                      onChange={e =>
                        setNewCustomRule({
                          ...newCustomRule,
                          priority: parseInt(e.target.value),
                        })
                      }
                      className='w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <button
                    onClick={addCustomRule}
                    disabled={
                      !newCustomRule.name ||
                      !newCustomRule.pattern ||
                      !newCustomRule.replacement
                    }
                    className='flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                  >
                    <Plus className='w-4 h-4' />
                    <span>新增規則</span>
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
