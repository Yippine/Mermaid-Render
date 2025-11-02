import {
  SyntaxError,
  SyntaxFix,
  ParseResult,
  ToleranceConfig,
  SyntaxAnalysisOptions,
  ToleranceLevel,
  SyntaxErrorType,
  SyntaxHealth,
} from './types'
import { ErrorDetector } from './ErrorDetector'
import { SyntaxFixer } from './SyntaxFixer'
import { VersionCompatibilityHandler } from './VersionCompatibilityHandler'

export class SyntaxAnalyzer {
  private errorDetector: ErrorDetector
  private syntaxFixer: SyntaxFixer
  private versionHandler: VersionCompatibilityHandler
  private defaultConfig: ToleranceConfig

  constructor(config?: Partial<ToleranceConfig>) {
    this.defaultConfig = {
      level: 'standard',
      enableAutoFix: true,
      enableVersionCompatibility: true,
      customRules: [],
      ignoredErrors: [],
      ...config,
    }

    this.errorDetector = new ErrorDetector()
    this.syntaxFixer = new SyntaxFixer()
    this.versionHandler = new VersionCompatibilityHandler()
  }

  /**
   * 分析 Mermaid 語法並嘗試修復錯誤
   */
  async analyze(
    code: string,
    options?: SyntaxAnalysisOptions
  ): Promise<ParseResult> {
    const startTime = performance.now()
    const config = { ...this.defaultConfig, ...options?.tolerance }

    try {
      // 1. 初始語法檢測
      const errors = await this.detectErrors(code, config)

      // 2. 版本相容性檢查
      if (config.enableVersionCompatibility) {
        const versionErrors = await this.versionHandler.checkCompatibility(code)
        errors.push(...versionErrors)
      }

      // 3. 過濾忽略的錯誤
      const filteredErrors = this.filterIgnoredErrors(
        errors,
        config.ignoredErrors
      )

      // 4. 嘗試修復錯誤
      let fixedCode = code
      let appliedFixes: SyntaxFix[] = []

      if (config.enableAutoFix && filteredErrors.length > 0) {
        const fixResult = await this.fixErrors(code, filteredErrors, config)
        fixedCode = fixResult.fixedCode
        appliedFixes = fixResult.fixes
      }

      // 5. 計算語法健康度
      const tolerance = this.calculateTolerance(
        code,
        fixedCode,
        filteredErrors,
        appliedFixes,
        config.level
      )

      // 6. 檢測圖表類型
      const chartType = this.detectChartType(fixedCode)

      const processingTime = performance.now() - startTime

      return {
        success:
          filteredErrors.filter(e => e.severity === 'error').length === 0,
        originalCode: code,
        fixedCode: code !== fixedCode ? fixedCode : undefined,
        errors: filteredErrors,
        fixes: appliedFixes,
        tolerance,
        metadata: {
          chartType,
          version: await this.versionHandler.detectVersion(code),
          processingTime,
        },
      }
    } catch (error) {
      const processingTime = performance.now() - startTime

      return {
        success: false,
        originalCode: code,
        errors: [
          {
            type: 'malformed-syntax',
            message: `語法分析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
            severity: 'error',
            position: { start: 0, end: code.length },
            fixable: false,
          },
        ],
        fixes: [],
        tolerance: {
          score: 0,
          level: config.level,
          warnings: ['語法分析過程中發生錯誤'],
        },
        metadata: {
          chartType: 'unknown',
          processingTime,
        },
      }
    }
  }

  /**
   * 檢測語法錯誤
   */
  private async detectErrors(
    code: string,
    config: ToleranceConfig
  ): Promise<SyntaxError[]> {
    const errors: SyntaxError[] = []

    // 基本語法錯誤檢測
    errors.push(...(await this.errorDetector.detectBasicErrors(code)))

    // 進階語法錯誤檢測
    if (config.level !== 'strict') {
      errors.push(...(await this.errorDetector.detectAdvancedErrors(code)))
    }

    // 自訂規則檢測
    if (config.customRules.length > 0) {
      errors.push(
        ...(await this.errorDetector.detectCustomRuleViolations(
          code,
          config.customRules
        ))
      )
    }

    return errors
  }

  /**
   * 修復語法錯誤
   */
  private async fixErrors(
    code: string,
    errors: SyntaxError[],
    config: ToleranceConfig
  ): Promise<{ fixedCode: string; fixes: SyntaxFix[] }> {
    const maxAttempts = 5
    let currentCode = code
    const allFixes: SyntaxFix[] = []
    let attempts = 0

    // 按優先級排序錯誤，優先修復高優先級的錯誤
    const sortedErrors = [...errors]
      .filter(error => error.fixable)
      .sort(
        (a, b) => this.getErrorPriority(a.type) - this.getErrorPriority(b.type)
      )

    while (attempts < maxAttempts && sortedErrors.length > 0) {
      let hasChanges = false

      for (const error of sortedErrors) {
        try {
          const fix = await this.syntaxFixer.fixError(
            currentCode,
            error,
            config
          )

          if (fix) {
            currentCode = fix.fixed
            allFixes.push(fix)
            hasChanges = true

            // 移除已修復的錯誤
            const errorIndex = sortedErrors.indexOf(error)
            if (errorIndex > -1) {
              sortedErrors.splice(errorIndex, 1)
            }
          }
        } catch (fixError) {
          console.warn('修復錯誤時發生問題:', fixError)
        }
      }

      if (!hasChanges) {
        break
      }

      attempts++
    }

    return {
      fixedCode: currentCode,
      fixes: allFixes,
    }
  }

  /**
   * 計算語法容錯度
   */
  private calculateTolerance(
    originalCode: string,
    fixedCode: string,
    errors: SyntaxError[],
    fixes: SyntaxFix[],
    level: ToleranceLevel
  ): { score: number; level: ToleranceLevel; warnings: string[] } {
    const criticalErrors = errors.filter(e => e.severity === 'error').length
    const warnings = errors.filter(e => e.severity === 'warning').length

    // 基礎分數計算
    let baseScore = 1.0
    baseScore -= criticalErrors * 0.2 // 嚴重錯誤每個扣 0.2
    baseScore -= warnings * 0.1 // 警告每個扣 0.1

    // 修復加分
    const successfulFixes = fixes.filter(f => f.confidence > 0.7).length
    baseScore += successfulFixes * 0.05 // 成功修復每個加 0.05

    // 根據容錯級別調整
    let adjustedScore = Math.max(0, Math.min(1, baseScore))

    if (level === 'relaxed') {
      adjustedScore = Math.min(1, adjustedScore * 1.2) // 寬鬆模式提升 20%
    } else if (level === 'strict') {
      adjustedScore = adjustedScore * 0.8 // 嚴格模式降低 20%
    }

    const warningMessages: string[] = []

    if (criticalErrors > 0) {
      warningMessages.push(`發現 ${criticalErrors} 個嚴重語法錯誤`)
    }

    if (warnings > 0) {
      warningMessages.push(`發現 ${warnings} 個語法警告`)
    }

    if (fixes.length > 0) {
      warningMessages.push(`已嘗試修復 ${fixes.length} 個問題`)
    }

    return {
      score: Math.round(adjustedScore * 100) / 100,
      level,
      warnings: warningMessages,
    }
  }

  /**
   * 檢測圖表類型
   */
  private detectChartType(code: string): string {
    const trimmedCode = code.trim().toLowerCase()

    if (
      trimmedCode.startsWith('graph') ||
      trimmedCode.startsWith('flowchart')
    ) {
      return 'flowchart'
    }
    if (
      trimmedCode.startsWith('sequencediagram') ||
      trimmedCode.includes('participant')
    ) {
      return 'sequenceDiagram'
    }
    if (
      trimmedCode.startsWith('classdiagram') ||
      trimmedCode.includes('class ')
    ) {
      return 'classDiagram'
    }
    if (
      trimmedCode.startsWith('statediagram') ||
      trimmedCode.includes('state ')
    ) {
      return 'stateDiagram'
    }
    if (trimmedCode.startsWith('journey')) {
      return 'journey'
    }
    if (trimmedCode.startsWith('gitgraph')) {
      return 'gitGraph'
    }

    return 'unknown'
  }

  /**
   * 取得錯誤優先級（數字越小優先級越高）
   */
  private getErrorPriority(errorType: SyntaxErrorType): number {
    const priorities: Record<SyntaxErrorType, number> = {
      'malformed-syntax': 1,
      'missing-quotes': 2,
      'invalid-node-id': 3,
      'inconsistent-arrow': 4,
      'indentation-error': 5,
      'missing-semicolon': 6,
      'invalid-character': 7,
      'duplicate-node': 8,
      'undefined-node-reference': 9,
      'version-incompatibility': 10,
      'unknown-directive': 11,
      'invalid-theme': 12,
      'circular-reference': 13,
    }

    return priorities[errorType] || 99
  }

  /**
   * 過濾忽略的錯誤
   */
  private filterIgnoredErrors(
    errors: SyntaxError[],
    ignoredTypes: SyntaxErrorType[]
  ): SyntaxError[] {
    if (ignoredTypes.length === 0) {
      return errors
    }

    return errors.filter(error => !ignoredTypes.includes(error.type))
  }

  /**
   * 計算語法健康度
   */
  calculateSyntaxHealth(parseResult: ParseResult): SyntaxHealth {
    const { errors } = parseResult

    const critical = errors.filter(e => e.severity === 'error').length
    const warnings = errors.filter(e => e.severity === 'warning').length
    const suggestions = errors.filter(e => e.severity === 'info').length

    const fixableCount = errors.filter(e => e.fixable).length
    const totalIssues = errors.length

    let recommendation = '語法良好'

    if (critical > 0) {
      recommendation = `需要修復 ${critical} 個嚴重錯誤`
    } else if (warnings > 3) {
      recommendation = `建議處理 ${warnings} 個警告以提升圖表品質`
    } else if (suggestions > 0) {
      recommendation = `可考慮 ${suggestions} 個改進建議`
    }

    return {
      score: parseResult.tolerance.score,
      issues: {
        critical,
        warnings,
        suggestions,
      },
      fixableCount,
      totalIssues,
      recommendation,
    }
  }

  /**
   * 更新容錯配置
   */
  updateConfig(config: Partial<ToleranceConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * 取得當前容錯配置
   */
  getConfig(): ToleranceConfig {
    return { ...this.defaultConfig }
  }
}
