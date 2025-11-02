import {
  SyntaxError,
  SyntaxFix,
  ToleranceConfig,
  SyntaxErrorType,
} from './types'

export class SyntaxFixer {
  private fixStrategies: Map<
    SyntaxErrorType,
    (code: string, error: SyntaxError) => SyntaxFix | null
  >

  constructor() {
    this.fixStrategies = new Map([
      ['missing-quotes', this.fixMissingQuotes.bind(this)],
      ['invalid-node-id', this.fixInvalidNodeId.bind(this)],
      ['inconsistent-arrow', this.fixInconsistentArrow.bind(this)],
      ['indentation-error', this.fixIndentationError.bind(this)],
      ['missing-semicolon', this.fixMissingSemicolon.bind(this)],
      ['invalid-character', this.fixInvalidCharacter.bind(this)],
      ['duplicate-node', this.fixDuplicateNode.bind(this)],
      ['undefined-node-reference', this.fixUndefinedNodeReference.bind(this)],
      ['version-incompatibility', this.fixVersionIncompatibility.bind(this)],
      ['unknown-directive', this.fixUnknownDirective.bind(this)],
      ['invalid-theme', this.fixInvalidTheme.bind(this)],
    ])
  }

  /**
   * 修復語法錯誤
   */
  async fixError(
    code: string,
    error: SyntaxError,
    config: ToleranceConfig
  ): Promise<SyntaxFix | null> {
    if (!error.fixable) {
      return null
    }

    const strategy = this.fixStrategies.get(error.type)
    if (!strategy) {
      return null
    }

    try {
      const fix = strategy(code, error)

      if (fix && this.validateFix(fix, config)) {
        return fix
      }
    } catch (fixError) {
      console.warn(`修復 ${error.type} 時發生錯誤:`, fixError)
    }

    return null
  }

  /**
   * 修復缺少引號的問題
   */
  private fixMissingQuotes(code: string, error: SyntaxError): SyntaxFix | null {
    const { start, end } = error.position
    const originalText = code.substring(start, end)

    // 匹配節點定義模式: A[Label with spaces]
    const nodeMatch = originalText.match(/(\w+)\s*\[\s*([^"'\[\]]+)\s*\]/)

    if (nodeMatch) {
      const [, nodeId, label] = nodeMatch
      const fixedText = `${nodeId}["${label.trim()}"]`

      return {
        type: 'add-quotes',
        original: originalText,
        fixed: fixedText,
        description: `為節點 "${nodeId}" 的標籤加上引號`,
        confidence: 0.9,
        position: error.position,
      }
    }

    return null
  }

  /**
   * 修復無效節點 ID
   */
  private fixInvalidNodeId(code: string, error: SyntaxError): SyntaxFix | null {
    const { start, end } = error.position
    const originalText = code.substring(start, end)

    // 匹配無效 ID 模式
    const invalidIdMatch = originalText.match(
      /^(\d+|class|if|for|while|function)([\[\(].*)/
    )

    if (invalidIdMatch) {
      const [, invalidId, rest] = invalidIdMatch
      let newId: string

      if (/^\d+$/.test(invalidId)) {
        // 數字開頭，加上字母前綴
        newId = `node${invalidId}`
      } else {
        // 保留關鍵字，加上下劃線前綴
        newId = `_${invalidId}`
      }

      const fixedText = `${newId}${rest}`

      return {
        type: 'fix-node-id',
        original: originalText,
        fixed: fixedText,
        description: `將無效節點 ID "${invalidId}" 修復為 "${newId}"`,
        confidence: 0.8,
        position: error.position,
      }
    }

    return null
  }

  /**
   * 修復箭頭語法不一致
   */
  private fixInconsistentArrow(
    code: string,
    error: SyntaxError
  ): SyntaxFix | null {
    // 分析整個程式碼中最常用的箭頭類型
    const arrowCounts = new Map<string, number>()
    const arrowTypes = ['-->', '->', '---', '-|>', '|->']

    for (const arrow of arrowTypes) {
      const matches = code.match(new RegExp(this.escapeRegExp(arrow), 'g'))
      if (matches) {
        arrowCounts.set(arrow, matches.length)
      }
    }

    // 找出最常用的箭頭類型
    const mostCommonArrow = Array.from(arrowCounts.entries()).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['-->', 0]
    )[0]

    const { start, end } = error.position
    const originalText = code.substring(start, end)

    // 如果當前箭頭不是最常用的，就替換它
    if (originalText !== mostCommonArrow && arrowTypes.includes(originalText)) {
      return {
        type: 'standardize-arrow',
        original: originalText,
        fixed: mostCommonArrow,
        description: `統一箭頭樣式為 "${mostCommonArrow}"`,
        confidence: 0.7,
        position: error.position,
      }
    }

    return null
  }

  /**
   * 修復縮排錯誤
   */
  private fixIndentationError(
    code: string,
    error: SyntaxError
  ): SyntaxFix | null {
    const lines = code.split('\n')
    const lineIndex = (error.line || 1) - 1

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return null
    }

    const line = lines[lineIndex]
    const trimmedLine = line.trim()

    if (trimmedLine.length === 0) {
      return null
    }

    const currentIndent = line.length - line.trimLeft().length
    const fixedIndent = Math.round(currentIndent / 2) * 2 // 調整為最接近的偶數
    const fixedLine = ' '.repeat(fixedIndent) + trimmedLine

    return {
      type: 'fix-indentation',
      original: line,
      fixed: fixedLine,
      description: `調整縮排為 ${fixedIndent} 個空格`,
      confidence: 0.8,
      position: {
        start: error.position.start,
        end: error.position.start + line.length,
      },
    }
  }

  /**
   * 修復缺少分號
   */
  private fixMissingSemicolon(
    code: string,
    error: SyntaxError
  ): SyntaxFix | null {
    const { start, end } = error.position
    const originalText = code.substring(start, end)

    // 簡單地在句末加上分號
    const fixedText = originalText.trimEnd() + ';'

    return {
      type: 'add-semicolon',
      original: originalText,
      fixed: fixedText,
      description: '在語句末尾加上分號',
      confidence: 0.6,
      position: error.position,
    }
  }

  /**
   * 修復無效字元
   */
  private fixInvalidCharacter(
    code: string,
    error: SyntaxError
  ): SyntaxFix | null {
    const { start, end } = error.position
    const invalidChar = code.substring(start, end)

    // 常見替換映射
    const replacements: Record<string, string> = {
      '\u2014': '--', // em dash to double dash
      '\u2013': '-', // en dash to dash
      '\u201C': '"', // left double quotation mark
      '\u201D': '"', // right double quotation mark
      '\u2018': "'", // left single quotation mark
      '\u2019': "'", // right single quotation mark
      '\u2026': '...', // horizontal ellipsis
    }

    const replacement = replacements[invalidChar]

    if (replacement) {
      return {
        type: 'remove-invalid-character',
        original: invalidChar,
        fixed: replacement,
        description: `將無效字元 "${invalidChar}" 替換為 "${replacement}"`,
        confidence: 0.8,
        position: error.position,
      }
    }

    // 如果沒有替換映射，就移除該字元
    return {
      type: 'remove-invalid-character',
      original: invalidChar,
      fixed: '',
      description: `移除無效字元 "${invalidChar}"`,
      confidence: 0.5,
      position: error.position,
    }
  }

  /**
   * 修復重複節點定義
   */
  private fixDuplicateNode(code: string, error: SyntaxError): SyntaxFix | null {
    const { start, end } = error.position
    const duplicateNodeId = code.substring(start, end)

    // 生成新的節點 ID
    const newNodeId = this.generateUniqueNodeId(code, duplicateNodeId)

    return {
      type: 'rename-duplicate-node',
      original: duplicateNodeId,
      fixed: newNodeId,
      description: `重新命名重複節點 "${duplicateNodeId}" 為 "${newNodeId}"`,
      confidence: 0.7,
      position: error.position,
    }
  }

  /**
   * 修復未定義的節點引用
   */
  private fixUndefinedNodeReference(
    code: string,
    error: SyntaxError
  ): SyntaxFix | null {
    const { start, end } = error.position
    const undefinedNodeId = code.substring(start, end)

    // 在程式碼開頭加入節點定義
    const nodeDefinition = `${undefinedNodeId}[${undefinedNodeId}]\n`

    return {
      type: 'add-node-definition',
      original: '',
      fixed: nodeDefinition,
      description: `為未定義的節點 "${undefinedNodeId}" 添加定義`,
      confidence: 0.6,
      position: {
        start: 0,
        end: 0,
      },
    }
  }

  /**
   * 修復版本不相容問題
   */
  private fixVersionIncompatibility(
    code: string,
    error: SyntaxError
  ): SyntaxFix | null {
    // 這裡可以實作具體的版本轉換邏輯
    // 目前簡化處理，只是標記需要版本轉換
    return {
      type: 'convert-version-syntax',
      original: code.substring(error.position.start, error.position.end),
      fixed: code.substring(error.position.start, error.position.end), // 暫時不修改
      description: '需要版本相容性轉換',
      confidence: 0.3,
      position: error.position,
    }
  }

  /**
   * 修復未知指令
   */
  private fixUnknownDirective(
    code: string,
    error: SyntaxError
  ): SyntaxFix | null {
    const { start, end } = error.position
    const unknownDirective = code.substring(start, end).trim()

    // 嘗試找出最相似的已知指令
    const knownDirectives = [
      'graph',
      'flowchart',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
    ]
    const suggestion = this.findClosestMatch(unknownDirective, knownDirectives)

    if (
      suggestion &&
      this.calculateSimilarity(unknownDirective, suggestion) > 0.6
    ) {
      return {
        type: 'remove-unknown-directive',
        original: unknownDirective,
        fixed: suggestion,
        description: `將未知指令 "${unknownDirective}" 修正為 "${suggestion}"`,
        confidence: 0.5,
        position: error.position,
      }
    }

    return null
  }

  /**
   * 修復無效主題引用
   */
  private fixInvalidTheme(code: string, error: SyntaxError): SyntaxFix | null {
    const { start, end } = error.position
    const originalText = code.substring(start, end)

    // 提取主題名稱
    const themeMatch = originalText.match(/(['"])([^'"]+)['"]/)
    if (!themeMatch) {
      return null
    }

    const [, quote, invalidTheme] = themeMatch
    const validThemes = ['default', 'base', 'dark', 'forest', 'neutral']
    const closestTheme = this.findClosestMatch(invalidTheme, validThemes)

    if (closestTheme) {
      const fixedText = originalText.replace(
        new RegExp(`${quote}${this.escapeRegExp(invalidTheme)}${quote}`),
        `${quote}${closestTheme}${quote}`
      )

      return {
        type: 'fix-theme-reference',
        original: originalText,
        fixed: fixedText,
        description: `將無效主題 "${invalidTheme}" 修正為 "${closestTheme}"`,
        confidence: 0.7,
        position: error.position,
      }
    }

    return null
  }

  /**
   * 生成唯一節點 ID
   */
  private generateUniqueNodeId(code: string, baseId: string): string {
    let counter = 1
    let newId = `${baseId}_${counter}`

    while (code.includes(newId)) {
      counter++
      newId = `${baseId}_${counter}`
    }

    return newId
  }

  /**
   * 找出最相似的匹配項
   */
  private findClosestMatch(
    target: string,
    candidates: string[]
  ): string | null {
    let bestMatch = null
    let bestScore = 0

    for (const candidate of candidates) {
      const score = this.calculateSimilarity(
        target.toLowerCase(),
        candidate.toLowerCase()
      )
      if (score > bestScore) {
        bestScore = score
        bestMatch = candidate
      }
    }

    return bestScore > 0.3 ? bestMatch : null
  }

  /**
   * 計算字串相似度（簡單的 Levenshtein distance 實作）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length)
    if (maxLength === 0) return 1

    const distance = this.levenshteinDistance(str1, str2)
    return 1 - distance / maxLength
  }

  /**
   * Levenshtein distance 演算法
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1

        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * 轉義正規表達式特殊字元
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 驗證修復結果
   */
  private validateFix(fix: SyntaxFix, config: ToleranceConfig): boolean {
    // 檢查信心度是否達標
    const minConfidence =
      config.level === 'strict' ? 0.8 : config.level === 'standard' ? 0.6 : 0.4

    if (fix.confidence < minConfidence) {
      return false
    }

    // 檢查修復是否合理（原文和修復後的文字不能相同）
    if (fix.original === fix.fixed) {
      return false
    }

    // 檢查修復內容是否為空（除了移除操作）
    if (fix.fixed.length === 0 && !fix.type.includes('remove')) {
      return false
    }

    return true
  }

  /**
   * 批量應用修復
   */
  async applyFixes(code: string, fixes: SyntaxFix[]): Promise<string> {
    // 按位置排序，從後往前應用修復避免位置偏移
    const sortedFixes = [...fixes].sort(
      (a, b) => b.position.start - a.position.start
    )

    let result = code

    for (const fix of sortedFixes) {
      const { start, end } = fix.position

      // 特殊處理：如果是在開頭插入內容
      if (start === 0 && end === 0) {
        result = fix.fixed + result
      } else {
        result = result.substring(0, start) + fix.fixed + result.substring(end)
      }
    }

    return result
  }
}
