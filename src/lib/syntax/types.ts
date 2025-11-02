export interface SyntaxError {
  type: SyntaxErrorType
  message: string
  line?: number
  column?: number
  position: {
    start: number
    end: number
  }
  severity: 'error' | 'warning' | 'info'
  suggestion?: string
  fixable: boolean
}

export interface SyntaxFix {
  type: SyntaxFixType
  original: string
  fixed: string
  description: string
  confidence: number // 0-1
  position: {
    start: number
    end: number
  }
}

export interface ParseResult {
  success: boolean
  originalCode: string
  fixedCode?: string
  errors: SyntaxError[]
  fixes: SyntaxFix[]
  tolerance: {
    score: number // 0-1, 語法健康度評分
    level: ToleranceLevel
    warnings: string[]
  }
  metadata: {
    chartType: string
    version?: string
    processingTime: number
  }
}

export interface ToleranceConfig {
  level: ToleranceLevel
  enableAutoFix: boolean
  enableVersionCompatibility: boolean
  customRules: CustomRule[]
  ignoredErrors: SyntaxErrorType[]
}

export interface CustomRule {
  id: string
  name: string
  pattern: string | RegExp
  replacement: string
  priority: number
  enabled: boolean
  description: string
}

export type ToleranceLevel = 'strict' | 'standard' | 'relaxed'

export type SyntaxErrorType =
  | 'missing-quotes'
  | 'invalid-node-id'
  | 'inconsistent-arrow'
  | 'indentation-error'
  | 'missing-semicolon'
  | 'invalid-character'
  | 'duplicate-node'
  | 'undefined-node-reference'
  | 'version-incompatibility'
  | 'malformed-syntax'
  | 'unknown-directive'
  | 'invalid-theme'
  | 'circular-reference'

export type SyntaxFixType =
  | 'add-quotes'
  | 'fix-node-id'
  | 'standardize-arrow'
  | 'fix-indentation'
  | 'add-semicolon'
  | 'remove-invalid-character'
  | 'rename-duplicate-node'
  | 'add-node-definition'
  | 'convert-version-syntax'
  | 'fix-malformed-syntax'
  | 'remove-unknown-directive'
  | 'fix-theme-reference'
  | 'resolve-circular-reference'

export interface VersionCompatibility {
  from: string
  to: string
  rules: VersionRule[]
}

export interface VersionRule {
  pattern: string | RegExp
  replacement: string
  description: string
  priority: number
}

export interface SyntaxAnalysisOptions {
  tolerance?: ToleranceConfig
  enableProgressiveParsing?: boolean
  enableVersionDetection?: boolean
  enableErrorIsolation?: boolean
  maxFixAttempts?: number
  timeout?: number
}

export interface ErrorPattern {
  id: string
  name: string
  pattern: string | RegExp
  errorType: SyntaxErrorType
  priority: number
  description: string
  examples: string[]
  fixes: SyntaxFix[]
}

export interface SyntaxHealth {
  score: number // 0-1
  issues: {
    critical: number
    warnings: number
    suggestions: number
  }
  fixableCount: number
  totalIssues: number
  recommendation: string
}
