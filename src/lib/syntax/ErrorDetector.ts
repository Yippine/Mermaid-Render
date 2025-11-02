import { SyntaxError, SyntaxErrorType, CustomRule, ErrorPattern } from './types'

export class ErrorDetector {
  private errorPatterns: ErrorPattern[] = [
    {
      id: 'missing-quotes-node',
      name: '節點標籤缺少引號',
      pattern: /(\w+)\s*\[\s*([^"'\[\]]+)\s*\]/g,
      errorType: 'missing-quotes',
      priority: 1,
      description: '節點標籤包含空格或特殊字元時需要加引號',
      examples: ['A[Node with spaces]'],
      fixes: [],
    },
    {
      id: 'invalid-node-id',
      name: '無效的節點 ID',
      pattern: /^(\d+|class|if|for|while|function)\s*[\[\(]/gm,
      errorType: 'invalid-node-id',
      priority: 2,
      description: '節點 ID 不能是數字開頭或保留關鍵字',
      examples: ['123[Start]', 'class[MyClass]'],
      fixes: [],
    },
    {
      id: 'inconsistent-arrow',
      name: '箭頭語法不一致',
      pattern: /(-->|->|---|-\|>|\|->)/g,
      errorType: 'inconsistent-arrow',
      priority: 3,
      description: '在同一個圖表中混用不同的箭頭語法',
      examples: ['A --> B', 'B -> C'],
      fixes: [],
    },
    {
      id: 'missing-semicolon',
      name: '缺少分號',
      pattern: /\w+\s*\[.*?\]\s*(?!-->|->|---|-\|>|\|->|\n|$)/g,
      errorType: 'missing-semicolon',
      priority: 4,
      description: '語句結束缺少分號',
      examples: ['A[Node] B[Another]'],
      fixes: [],
    },
  ]

  /**
   * 檢測基本語法錯誤
   */
  async detectBasicErrors(code: string): Promise<SyntaxError[]> {
    const errors: SyntaxError[] = []
    const lines = code.split('\n')

    // 檢查空白程式碼
    if (code.trim().length === 0) {
      errors.push({
        type: 'malformed-syntax',
        message: '程式碼內容為空',
        severity: 'error',
        position: { start: 0, end: 0 },
        fixable: false,
      })
      return errors
    }

    // 檢查基本語法模式
    for (const pattern of this.errorPatterns) {
      const matches = this.findPatternMatches(code, pattern)
      errors.push(...matches)
    }

    // 檢查縮排問題
    errors.push(...this.detectIndentationErrors(lines))

    // 檢查無效字元
    errors.push(...this.detectInvalidCharacters(code))

    // 檢查未定義的節點引用
    errors.push(...this.detectUndefinedNodeReferences(code))

    // 檢查重複節點定義
    errors.push(...this.detectDuplicateNodes(code))

    return errors
  }

  /**
   * 檢測進階語法錯誤
   */
  async detectAdvancedErrors(code: string): Promise<SyntaxError[]> {
    const errors: SyntaxError[] = []

    // 檢查循環引用
    errors.push(...this.detectCircularReferences(code))

    // 檢查未知指令
    errors.push(...this.detectUnknownDirectives(code))

    // 檢查主題引用
    errors.push(...this.detectInvalidThemeReferences(code))

    return errors
  }

  /**
   * 檢測自訂規則違反
   */
  async detectCustomRuleViolations(
    code: string,
    customRules: CustomRule[]
  ): Promise<SyntaxError[]> {
    const errors: SyntaxError[] = []

    for (const rule of customRules.filter(r => r.enabled)) {
      const pattern =
        typeof rule.pattern === 'string'
          ? new RegExp(rule.pattern, 'g')
          : rule.pattern

      let match
      while ((match = pattern.exec(code)) !== null) {
        errors.push({
          type: 'malformed-syntax',
          message: `自訂規則違反: ${rule.name}`,
          severity: 'warning',
          position: {
            start: match.index,
            end: match.index + match[0].length,
          },
          suggestion: rule.description,
          fixable: true,
        })
      }
    }

    return errors
  }

  /**
   * 尋找模式匹配
   */
  private findPatternMatches(
    code: string,
    pattern: ErrorPattern
  ): SyntaxError[] {
    const errors: SyntaxError[] = []
    const regex =
      typeof pattern.pattern === 'string'
        ? new RegExp(pattern.pattern, 'g')
        : new RegExp(pattern.pattern.source, 'g')

    let match
    while ((match = regex.exec(code)) !== null) {
      const lineInfo = this.getLineInfo(code, match.index)

      errors.push({
        type: pattern.errorType,
        message: pattern.description,
        line: lineInfo.line,
        column: lineInfo.column,
        severity: this.getSeverityForErrorType(pattern.errorType),
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
        suggestion: this.getSuggestionForError(pattern.errorType),
        fixable: true,
      })
    }

    return errors
  }

  /**
   * 檢測縮排錯誤
   */
  private detectIndentationErrors(lines: string[]): SyntaxError[] {
    const errors: SyntaxError[] = []
    let position = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      // 跳過空行和註解
      if (trimmedLine.length === 0 || trimmedLine.startsWith('%%')) {
        position += line.length + 1 // +1 for newline
        continue
      }

      const actualIndent = line.length - line.trimLeft().length

      // 檢查縮排是否合理（應該是 2 或 4 的倍數）
      if (actualIndent % 2 !== 0 && actualIndent > 0) {
        errors.push({
          type: 'indentation-error',
          message: `第 ${i + 1} 行縮排不正確，應使用 2 或 4 個空格的倍數`,
          line: i + 1,
          column: 1,
          severity: 'warning',
          position: {
            start: position,
            end: position + actualIndent,
          },
          suggestion: '使用一致的縮排（建議 2 個空格）',
          fixable: true,
        })
      }

      position += line.length + 1 // +1 for newline
    }

    return errors
  }

  /**
   * 檢測無效字元
   */
  private detectInvalidCharacters(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const invalidChars = /[^\w\s\-\>\<\[\]\(\)\{\}\|\"\'\.,:;=\+\*\/\\%#]/g

    let match
    while ((match = invalidChars.exec(code)) !== null) {
      const lineInfo = this.getLineInfo(code, match.index)

      errors.push({
        type: 'invalid-character',
        message: `發現無效字元: '${match[0]}'`,
        line: lineInfo.line,
        column: lineInfo.column,
        severity: 'warning',
        position: {
          start: match.index,
          end: match.index + 1,
        },
        suggestion: '移除或替換無效字元',
        fixable: true,
      })
    }

    return errors
  }

  /**
   * 檢測未定義的節點引用
   */
  private detectUndefinedNodeReferences(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const definedNodes = new Set<string>()
    const referencedNodes = new Set<string>()

    // 找出所有定義的節點
    const nodeDefinitionPattern = /(\w+)\s*[\[\(]/g
    let match
    while ((match = nodeDefinitionPattern.exec(code)) !== null) {
      definedNodes.add(match[1])
    }

    // 找出所有引用的節點
    const nodeReferencePattern = /(\w+)\s*--[->]|--[->]\s*(\w+)/g
    while ((match = nodeReferencePattern.exec(code)) !== null) {
      if (match[1]) referencedNodes.add(match[1])
      if (match[2]) referencedNodes.add(match[2])
    }

    // 檢查未定義的引用
    for (const referencedNode of Array.from(referencedNodes)) {
      if (!definedNodes.has(referencedNode)) {
        const index = code.indexOf(referencedNode)
        if (index !== -1) {
          const lineInfo = this.getLineInfo(code, index)

          errors.push({
            type: 'undefined-node-reference',
            message: `節點 '${referencedNode}' 被引用但未定義`,
            line: lineInfo.line,
            column: lineInfo.column,
            severity: 'error',
            position: {
              start: index,
              end: index + referencedNode.length,
            },
            suggestion: `定義節點: ${referencedNode}[標籤]`,
            fixable: true,
          })
        }
      }
    }

    return errors
  }

  /**
   * 檢測重複節點定義
   */
  private detectDuplicateNodes(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const nodeOccurrences = new Map<string, number[]>()

    const nodePattern = /(\w+)\s*[\[\(]/g
    let match
    while ((match = nodePattern.exec(code)) !== null) {
      const nodeName = match[1]
      if (!nodeOccurrences.has(nodeName)) {
        nodeOccurrences.set(nodeName, [])
      }
      nodeOccurrences.get(nodeName)!.push(match.index)
    }

    // 檢查重複定義
    for (const [nodeName, positions] of Array.from(nodeOccurrences.entries())) {
      if (positions.length > 1) {
        for (let i = 1; i < positions.length; i++) {
          const lineInfo = this.getLineInfo(code, positions[i])

          errors.push({
            type: 'duplicate-node',
            message: `節點 '${nodeName}' 重複定義`,
            line: lineInfo.line,
            column: lineInfo.column,
            severity: 'warning',
            position: {
              start: positions[i],
              end: positions[i] + nodeName.length,
            },
            suggestion: `重新命名重複的節點或移除重複定義`,
            fixable: true,
          })
        }
      }
    }

    return errors
  }

  /**
   * 檢測循環引用
   */
  private detectCircularReferences(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const connections = new Map<string, string[]>()

    // 建立連接圖
    const connectionPattern = /(\w+)\s*--[->]\s*(\w+)/g
    let match
    while ((match = connectionPattern.exec(code)) !== null) {
      const from = match[1]
      const to = match[2]

      if (!connections.has(from)) {
        connections.set(from, [])
      }
      connections.get(from)!.push(to)
    }

    // 檢測循環
    for (const startNode of Array.from(connections.keys())) {
      const visited = new Set<string>()
      const recursionStack = new Set<string>()

      if (this.hasCycle(startNode, connections, visited, recursionStack)) {
        const index = code.indexOf(startNode)
        const lineInfo = this.getLineInfo(code, index)

        errors.push({
          type: 'circular-reference',
          message: `檢測到循環引用，起始於節點 '${startNode}'`,
          line: lineInfo.line,
          column: lineInfo.column,
          severity: 'warning',
          position: {
            start: index,
            end: index + startNode.length,
          },
          suggestion: '檢查並移除循環引用',
          fixable: false,
        })
      }
    }

    return errors
  }

  /**
   * 檢測未知指令
   */
  private detectUnknownDirectives(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const knownDirectives = [
      'graph',
      'flowchart',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'journey',
      'gitGraph',
      'pie',
      'gantt',
    ]

    const lines = code.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // 檢查第一個非空行是否為指令
      if (
        i === 0 ||
        (i > 0 &&
          lines
            .slice(0, i)
            .every(l => l.trim().length === 0 || l.trim().startsWith('%%')))
      ) {
        if (
          line &&
          !line.startsWith('%%') &&
          !line.includes('-->') &&
          !line.includes('[')
        ) {
          const firstWord = line.split(/\s+/)[0].toLowerCase()
          const isKnownDirective = knownDirectives.some(
            directive => firstWord === directive.toLowerCase()
          )

          if (!isKnownDirective && firstWord.match(/^[a-z]+$/)) {
            const position =
              code.split('\n').slice(0, i).join('\n').length + (i > 0 ? 1 : 0)

            errors.push({
              type: 'unknown-directive',
              message: `未知的指令: '${firstWord}'`,
              line: i + 1,
              column: 1,
              severity: 'warning',
              position: {
                start: position,
                end: position + firstWord.length,
              },
              suggestion: '確認指令名稱是否正確',
              fixable: false,
            })
            break // 只檢查第一個指令行
          }
        }
      }
    }

    return errors
  }

  /**
   * 檢測無效主題引用
   */
  private detectInvalidThemeReferences(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const validThemes = ['default', 'base', 'dark', 'forest', 'neutral']

    const themePattern =
      /%%{init:\s*\{\s*['"]?theme['"]?\s*:\s*['"]([^'"]+)['"][^}]*\}}%%/g
    let match

    while ((match = themePattern.exec(code)) !== null) {
      const themeName = match[1]

      if (!validThemes.includes(themeName)) {
        const lineInfo = this.getLineInfo(code, match.index)

        errors.push({
          type: 'invalid-theme',
          message: `無效的主題: '${themeName}'`,
          line: lineInfo.line,
          column: lineInfo.column,
          severity: 'warning',
          position: {
            start: match.index,
            end: match.index + match[0].length,
          },
          suggestion: `使用有效主題: ${validThemes.join(', ')}`,
          fixable: true,
        })
      }
    }

    return errors
  }

  /**
   * 檢查是否有循環（DFS）
   */
  private hasCycle(
    node: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    if (recursionStack.has(node)) {
      return true
    }

    if (visited.has(node)) {
      return false
    }

    visited.add(node)
    recursionStack.add(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (this.hasCycle(neighbor, graph, visited, recursionStack)) {
        return true
      }
    }

    recursionStack.delete(node)
    return false
  }

  /**
   * 取得行和列資訊
   */
  private getLineInfo(
    code: string,
    position: number
  ): { line: number; column: number } {
    const beforePosition = code.substring(0, position)
    const lines = beforePosition.split('\n')

    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    }
  }

  /**
   * 根據錯誤類型取得嚴重程度
   */
  private getSeverityForErrorType(
    errorType: SyntaxErrorType
  ): 'error' | 'warning' | 'info' {
    const errorSeverities: Record<
      SyntaxErrorType,
      'error' | 'warning' | 'info'
    > = {
      'malformed-syntax': 'error',
      'missing-quotes': 'warning',
      'invalid-node-id': 'error',
      'inconsistent-arrow': 'warning',
      'indentation-error': 'info',
      'missing-semicolon': 'warning',
      'invalid-character': 'warning',
      'duplicate-node': 'warning',
      'undefined-node-reference': 'error',
      'version-incompatibility': 'warning',
      'unknown-directive': 'warning',
      'invalid-theme': 'warning',
      'circular-reference': 'warning',
    }

    return errorSeverities[errorType] || 'warning'
  }

  /**
   * 根據錯誤類型取得修復建議
   */
  private getSuggestionForError(errorType: SyntaxErrorType): string {
    const suggestions: Record<SyntaxErrorType, string> = {
      'missing-quotes': '在節點標籤加上引號',
      'invalid-node-id': '使用有效的節點 ID（字母開頭，避免保留字）',
      'inconsistent-arrow': '統一使用相同的箭頭樣式',
      'indentation-error': '使用一致的縮排（建議 2 個空格）',
      'missing-semicolon': '在語句末尾加上分號',
      'invalid-character': '移除或替換無效字元',
      'duplicate-node': '重新命名重複的節點',
      'undefined-node-reference': '定義被引用的節點',
      'version-incompatibility': '更新為相容的語法版本',
      'malformed-syntax': '檢查並修正語法格式',
      'unknown-directive': '確認指令名稱是否正確',
      'invalid-theme': '使用有效的主題名稱',
      'circular-reference': '移除循環引用',
    }

    return suggestions[errorType] || '請檢查語法'
  }
}
