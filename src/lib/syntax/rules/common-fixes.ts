import { CustomRule, ErrorPattern } from '../types'

/**
 * 常見語法錯誤修復規則
 */
export const COMMON_FIX_RULES: CustomRule[] = [
  {
    id: 'add-quotes-to-labels',
    name: '為包含空格的標籤加引號',
    pattern: /(\w+)\s*\[\s*([^"'\[\]]+\s+[^"'\[\]]*)\s*\]/g,
    replacement: '$1["$2"]',
    priority: 1,
    enabled: true,
    description: '自動為包含空格的節點標籤添加引號',
  },
  {
    id: 'fix-arrow-spacing',
    name: '修復箭頭間距',
    pattern: /(\w+)\s*-->\s*(\w+)/g,
    replacement: '$1 --> $2',
    priority: 2,
    enabled: true,
    description: '統一箭頭前後的空格',
  },
  {
    id: 'remove-trailing-semicolon',
    name: '移除多餘的分號',
    pattern: /;+\s*$/gm,
    replacement: '',
    priority: 3,
    enabled: true,
    description: '移除行末多餘的分號',
  },
  {
    id: 'normalize-line-endings',
    name: '標準化換行符',
    pattern: /\r\n/g,
    replacement: '\n',
    priority: 4,
    enabled: true,
    description: '將 Windows 換行符轉換為 Unix 格式',
  },
  {
    id: 'fix-double-dashes',
    name: '修復雙破折號',
    pattern: /(\w+)\s*—\s*(\w+)/g,
    replacement: '$1 --> $2',
    priority: 5,
    enabled: true,
    description: '將全形破折號轉換為箭頭語法',
  },
]

/**
 * 常見錯誤模式
 */
export const COMMON_ERROR_PATTERNS: ErrorPattern[] = [
  {
    id: 'unquoted-labels-with-spaces',
    name: '未加引號的標籤包含空格',
    pattern: /(\w+)\s*\[\s*([^"'\[\]]+\s+[^"'\[\]]*)\s*\]/g,
    errorType: 'missing-quotes',
    priority: 1,
    description: '節點標籤包含空格時必須加引號',
    examples: ['A[My Node]', 'B[Another Node with spaces]'],
    fixes: [],
  },
  {
    id: 'inconsistent-arrows',
    name: '不一致的箭頭樣式',
    pattern: /(-->|->|---|-\|>|\|->)/g,
    errorType: 'inconsistent-arrow',
    priority: 2,
    description: '圖表中混用不同的箭頭樣式',
    examples: ['A --> B', 'B -> C', 'C --- D'],
    fixes: [],
  },
  {
    id: 'numeric-node-ids',
    name: '數字開頭的節點 ID',
    pattern: /^\s*(\d+)\s*[\[\(]/gm,
    errorType: 'invalid-node-id',
    priority: 3,
    description: '節點 ID 不應該以數字開頭',
    examples: ['1[First Node]', '123[Another Node]'],
    fixes: [],
  },
  {
    id: 'reserved-keywords',
    name: '使用保留關鍵字作為節點 ID',
    pattern: /^\s*(class|if|for|while|function|var|let|const)\s*[\[\(]/gm,
    errorType: 'invalid-node-id',
    priority: 4,
    description: '不應使用 JavaScript 保留關鍵字作為節點 ID',
    examples: ['class[My Class]', 'if[Decision]'],
    fixes: [],
  },
  {
    id: 'missing-node-definitions',
    name: '缺少節點定義',
    pattern: /(\w+)\s*-->\s*(\w+)/g,
    errorType: 'undefined-node-reference',
    priority: 5,
    description: '引用了未定義的節點',
    examples: ['A --> B  %% B 未定義'],
    fixes: [],
  },
]

/**
 * 版本特定的錯誤模式
 */
export const VERSION_SPECIFIC_PATTERNS: Record<string, ErrorPattern[]> = {
  v8: [
    {
      id: 'graph-syntax',
      name: '舊版 graph 語法',
      pattern: /graph\s+(TD|TB|BT|RL|LR)/gi,
      errorType: 'version-incompatibility',
      priority: 1,
      description: 'graph 語法在 v9+ 中已被 flowchart 取代',
      examples: ['graph TD'],
      fixes: [],
    },
    {
      id: 'brace-subgraph',
      name: '大括號子圖語法',
      pattern: /subgraph\s+([^{\n]+)\s*{([^}]*)}/gi,
      errorType: 'version-incompatibility',
      priority: 2,
      description: '大括號子圖語法在 v9+ 中不推薦使用',
      examples: ['subgraph A { B --> C }'],
      fixes: [],
    },
  ],
  v9: [
    {
      id: 'old-click-syntax',
      name: '舊版點擊語法',
      pattern: /click\s+(\w+)\s+"([^"]+)"/gi,
      errorType: 'version-incompatibility',
      priority: 1,
      description: 'v10+ 中點擊語法需要指定目標',
      examples: ['click A "https://example.com"'],
      fixes: [],
    },
  ],
}

/**
 * 自動修復建議生成器
 */
export class CommonFixSuggestionGenerator {
  /**
   * 為缺少引號的標籤生成修復建議
   */
  static generateQuotesSuggestion(nodeId: string, label: string): string {
    return `將節點 "${nodeId}" 的標籤改為 "${nodeId}["${label}"]"`
  }

  /**
   * 為無效節點 ID 生成修復建議
   */
  static generateNodeIdSuggestion(invalidId: string): string {
    if (/^\d+$/.test(invalidId)) {
      return `將數字 ID "${invalidId}" 改為 "node${invalidId}" 或其他有效 ID`
    }

    if (
      [
        'class',
        'if',
        'for',
        'while',
        'function',
        'var',
        'let',
        'const',
      ].includes(invalidId)
    ) {
      return `將保留關鍵字 "${invalidId}" 改為 "_${invalidId}" 或其他有效 ID`
    }

    return `將無效 ID "${invalidId}" 改為有效的節點識別符`
  }

  /**
   * 為箭頭不一致生成修復建議
   */
  static generateArrowSuggestion(code: string): string {
    const arrowCounts = new Map<string, number>()
    const arrows = ['-->', '->', '---', '-|>', '|->']

    for (const arrow of arrows) {
      const matches = code.match(
        new RegExp(arrow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      )
      if (matches) {
        arrowCounts.set(arrow, matches.length)
      }
    }

    const mostCommon = Array.from(arrowCounts.entries()).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['-->', 0]
    )[0]

    return `統一使用 "${mostCommon}" 作為連接箭頭`
  }

  /**
   * 為版本不相容生成修復建議
   */
  static generateVersionSuggestion(
    detectedVersion: string,
    targetVersion: string
  ): string {
    const suggestions = new Map([
      ['v8->v9+', '將 "graph" 改為 "flowchart"，將大括號子圖改為 "end" 語法'],
      ['v9->v10+', '為點擊事件添加目標屬性，更新樣式定義格式'],
    ])

    const key = `${detectedVersion}->${targetVersion}`
    return suggestions.get(key) || `升級語法以相容 ${targetVersion}`
  }
}

/**
 * 取得特定容錯級別的規則
 */
export function getRulesForToleranceLevel(
  level: 'strict' | 'standard' | 'relaxed'
): CustomRule[] {
  const allRules = [...COMMON_FIX_RULES]

  switch (level) {
    case 'strict':
      // 嚴格模式只啟用高信心度的規則
      return allRules.filter(rule => rule.priority <= 2)

    case 'standard':
      // 標準模式啟用大部分規則
      return allRules.filter(rule => rule.priority <= 4)

    case 'relaxed':
      // 寬鬆模式啟用所有規則
      return allRules

    default:
      return allRules.filter(rule => rule.priority <= 3)
  }
}

/**
 * 取得特定錯誤類型的修復建議
 */
export function getFixSuggestionForError(
  errorType: string,
  context: { nodeId?: string; label?: string; code?: string }
): string {
  switch (errorType) {
    case 'missing-quotes':
      return context.nodeId && context.label
        ? CommonFixSuggestionGenerator.generateQuotesSuggestion(
            context.nodeId,
            context.label
          )
        : '為包含空格或特殊字元的標籤添加引號'

    case 'invalid-node-id':
      return context.nodeId
        ? CommonFixSuggestionGenerator.generateNodeIdSuggestion(context.nodeId)
        : '使用有效的節點識別符（字母開頭，避免保留字）'

    case 'inconsistent-arrow':
      return context.code
        ? CommonFixSuggestionGenerator.generateArrowSuggestion(context.code)
        : '統一使用相同的箭頭樣式'

    default:
      return '請檢查語法並進行相應修復'
  }
}
