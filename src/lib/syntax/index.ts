// 主要匯入和匯出
import { SyntaxAnalyzer } from './SyntaxAnalyzer'
import { ErrorDetector } from './ErrorDetector'
import { SyntaxFixer } from './SyntaxFixer'
import { VersionCompatibilityHandler } from './VersionCompatibilityHandler'

export {
  SyntaxAnalyzer,
  ErrorDetector,
  SyntaxFixer,
  VersionCompatibilityHandler,
}

// 型別匯入和匯出
import type {
  ToleranceConfig,
  SyntaxAnalysisOptions,
  ParseResult,
  SyntaxFix,
  SyntaxHealth,
} from './types'

export type {
  SyntaxError,
  SyntaxFix,
  ParseResult,
  ToleranceConfig,
  CustomRule,
  ToleranceLevel,
  SyntaxAnalysisOptions,
  SyntaxErrorType,
  SyntaxFixType,
  VersionCompatibility,
  VersionRule,
  ErrorPattern,
  SyntaxHealth,
} from './types'

// 預設配置
export const DEFAULT_TOLERANCE_CONFIG: ToleranceConfig = {
  level: 'standard',
  enableAutoFix: true,
  enableVersionCompatibility: true,
  customRules: [],
  ignoredErrors: [],
}

// 實用工具函數
export const createSyntaxAnalyzer = (config?: Partial<ToleranceConfig>) => {
  return new SyntaxAnalyzer(config)
}

export const createErrorDetector = () => {
  return new ErrorDetector()
}

export const createSyntaxFixer = () => {
  return new SyntaxFixer()
}

export const createVersionHandler = () => {
  return new VersionCompatibilityHandler()
}

// 快速分析函數
export const quickAnalyze = async (
  code: string,
  options?: SyntaxAnalysisOptions
): Promise<ParseResult> => {
  const analyzer = createSyntaxAnalyzer(options?.tolerance)
  return analyzer.analyze(code, options)
}

// 快速修復函數
export const quickFix = async (
  code: string,
  config?: Partial<ToleranceConfig>
): Promise<{ success: boolean; fixedCode: string; fixes: SyntaxFix[] }> => {
  const analyzer = createSyntaxAnalyzer(config)
  const result = await analyzer.analyze(code)

  return {
    success: result.success,
    fixedCode: result.fixedCode || result.originalCode,
    fixes: result.fixes,
  }
}

// 版本檢測函數
export const detectMermaidVersion = async (
  code: string
): Promise<string | undefined> => {
  const handler = createVersionHandler()
  return handler.detectVersion(code)
}

// 版本轉換函數
export const convertMermaidVersion = async (
  code: string,
  targetVersion: string
): Promise<string> => {
  const handler = createVersionHandler()
  return handler.convertToVersion(code, targetVersion)
}

// 語法健康度檢查函數
export const checkSyntaxHealth = async (
  code: string,
  config?: Partial<ToleranceConfig>
): Promise<SyntaxHealth> => {
  const analyzer = createSyntaxAnalyzer(config)
  const result = await analyzer.analyze(code)
  return analyzer.calculateSyntaxHealth(result)
}
