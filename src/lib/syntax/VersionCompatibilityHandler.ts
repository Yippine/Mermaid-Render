import { SyntaxError, VersionCompatibility, VersionRule } from './types'

export class VersionCompatibilityHandler {
  private versionRules: VersionCompatibility[] = [
    // Mermaid v8 to v9+ 轉換規則
    {
      from: 'v8',
      to: 'v9+',
      rules: [
        {
          pattern: /graph\s+(TD|TB|BT|RL|LR)\s*;?/gi,
          replacement: 'flowchart $1',
          description: '將 graph 語法轉換為 flowchart',
          priority: 1,
        },
        {
          pattern: /subgraph\s+([^{\n]+)\s*{([^}]*)}/gi,
          replacement: 'subgraph $1\n$2\nend',
          description: '將大括號語法轉換為 end 語法',
          priority: 2,
        },
        {
          pattern: /style\s+(\w+)\s+fill\s*:\s*([^,;\n]+)/gi,
          replacement: 'style $1 fill:$2',
          description: '修復樣式語法格式',
          priority: 3,
        },
      ],
    },
    // Mermaid v9 to v10+ 轉換規則
    {
      from: 'v9',
      to: 'v10+',
      rules: [
        {
          pattern:
            /classDef\s+(\w+)\s+fill\s*:\s*([^,;\n]+),\s*stroke\s*:\s*([^,;\n]+)/gi,
          replacement: 'classDef $1 fill:$2,stroke:$3',
          description: '更新 classDef 語法格式',
          priority: 1,
        },
        {
          pattern: /click\s+(\w+)\s+"([^"]+)"\s+"([^"]+)"/gi,
          replacement: 'click $1 "$2" "$3" _blank',
          description: '為 click 事件添加目標屬性',
          priority: 2,
        },
      ],
    },
  ]

  private versionDetectionPatterns = new Map<string, RegExp[]>([
    [
      'v8',
      [
        /graph\s+(TD|TB|BT|RL|LR)/i,
        /subgraph\s+[^{\n]+\s*{/i,
        /style\s+\w+\s+fill\s*:/i,
      ],
    ],
    [
      'v9',
      [
        /flowchart\s+(TD|TB|BT|RL|LR)/i,
        /subgraph\s+[^{\n]+[\s\S]*?end/i,
        /classDef\s+\w+\s+fill:/i,
      ],
    ],
    [
      'v10+',
      [
        /click\s+\w+\s+"[^"]+"\s+"[^"]+"\s+_blank/i,
        /%%{init:\s*{[^}]*}}%%/i,
        /flowchart\s+(TD|TB|BT|RL|LR)/i,
      ],
    ],
  ])

  /**
   * 檢測程式碼的 Mermaid 版本
   */
  async detectVersion(code: string): Promise<string | undefined> {
    const detectedVersions: Array<{ version: string; confidence: number }> = []

    for (const [version, patterns] of Array.from(
      this.versionDetectionPatterns.entries()
    )) {
      let matchCount = 0

      for (const pattern of patterns) {
        if (pattern.test(code)) {
          matchCount++
        }
      }

      if (matchCount > 0) {
        const confidence = matchCount / patterns.length
        detectedVersions.push({ version, confidence })
      }
    }

    // 按信心度排序，返回最可能的版本
    if (detectedVersions.length > 0) {
      detectedVersions.sort((a, b) => b.confidence - a.confidence)
      return detectedVersions[0].version
    }

    return undefined
  }

  /**
   * 檢查版本相容性問題
   */
  async checkCompatibility(code: string): Promise<SyntaxError[]> {
    const errors: SyntaxError[] = []
    const detectedVersion = await this.detectVersion(code)

    if (!detectedVersion) {
      return errors
    }

    // 檢查是否有混合版本語法
    const versionConflicts = this.detectVersionConflicts(code)
    errors.push(...versionConflicts)

    // 檢查過時的語法
    const deprecatedSyntax = this.detectDeprecatedSyntax(code, detectedVersion)
    errors.push(...deprecatedSyntax)

    return errors
  }

  /**
   * 轉換程式碼到指定版本
   */
  async convertToVersion(code: string, targetVersion: string): Promise<string> {
    const currentVersion = await this.detectVersion(code)

    if (!currentVersion || currentVersion === targetVersion) {
      return code
    }

    let convertedCode = code

    // 找出適用的轉換規則
    const applicableRules = this.getApplicableRules(
      currentVersion,
      targetVersion
    )

    // 按優先級排序並應用規則
    const sortedRules = applicableRules.sort((a, b) => a.priority - b.priority)

    for (const rule of sortedRules) {
      convertedCode = this.applyVersionRule(convertedCode, rule)
    }

    return convertedCode
  }

  /**
   * 檢測版本衝突
   */
  private detectVersionConflicts(code: string): SyntaxError[] {
    const errors: SyntaxError[] = []
    const detectedVersions = new Set<string>()

    // 檢測所有可能的版本指示符，但 v10+ 與其他版本兼容
    for (const [version, patterns] of Array.from(
      this.versionDetectionPatterns.entries()
    )) {
      for (const pattern of patterns) {
        if (pattern.test(code)) {
          detectedVersions.add(version)
          break
        }
      }
    }

    // 移除相容的版本組合
    if (detectedVersions.has('v10+') && detectedVersions.has('v9')) {
      detectedVersions.delete('v9') // v10+ 包含 v9 功能
    }

    // 只有在檢測到真正衝突的版本時才報告錯誤
    const conflictingVersions = Array.from(detectedVersions)
    const realConflicts = conflictingVersions.filter((version, index, arr) => {
      if (version === 'v8') return arr.includes('v9') || arr.includes('v10+')
      return false
    })

    if (
      realConflicts.length > 0 ||
      (detectedVersions.has('v8') && detectedVersions.size > 1)
    ) {
      const versions = Array.from(detectedVersions)

      errors.push({
        type: 'version-incompatibility',
        message: `檢測到混合版本語法: ${versions.join(', ')}`,
        severity: 'warning',
        position: { start: 0, end: code.length },
        suggestion: `統一使用單一版本語法，建議使用最新版本`,
        fixable: true,
      })
    }

    return errors
  }

  /**
   * 檢測過時的語法
   */
  private detectDeprecatedSyntax(code: string, version: string): SyntaxError[] {
    const errors: SyntaxError[] = []

    // v8 過時語法檢測
    if (version === 'v8') {
      const deprecatedPatterns = [
        {
          pattern: /graph\s+(TD|TB|BT|RL|LR)/gi,
          message: 'graph 語法在新版本中已被 flowchart 取代',
          suggestion: '將 graph 替換為 flowchart',
        },
        {
          pattern: /subgraph\s+([^{\n]+)\s*{([^}]*)}/gi,
          message: '大括號語法在新版本中已不推薦使用',
          suggestion: '使用 end 關鍵字替代大括號',
        },
      ]

      for (const deprecated of deprecatedPatterns) {
        let match
        const regex = new RegExp(
          deprecated.pattern.source,
          deprecated.pattern.flags
        )

        while ((match = regex.exec(code)) !== null) {
          const lineInfo = this.getLineInfo(code, match.index)

          errors.push({
            type: 'version-incompatibility',
            message: deprecated.message,
            line: lineInfo.line,
            column: lineInfo.column,
            severity: 'warning',
            position: {
              start: match.index,
              end: match.index + match[0].length,
            },
            suggestion: deprecated.suggestion,
            fixable: true,
          })
        }
      }
    }

    return errors
  }

  /**
   * 取得適用的版本轉換規則
   */
  private getApplicableRules(
    fromVersion: string,
    toVersion: string
  ): VersionRule[] {
    const rules: VersionRule[] = []

    for (const versionRule of this.versionRules) {
      if (this.isRuleApplicable(versionRule, fromVersion, toVersion)) {
        rules.push(...versionRule.rules)
      }
    }

    return rules
  }

  /**
   * 檢查規則是否適用於版本轉換
   */
  private isRuleApplicable(
    versionRule: VersionCompatibility,
    fromVersion: string,
    toVersion: string
  ): boolean {
    // 簡化的版本匹配邏輯
    const fromMatch =
      fromVersion === versionRule.from ||
      (versionRule.from === 'v8' && fromVersion === 'v8') ||
      (versionRule.from === 'v9' && fromVersion === 'v9')

    const toMatch =
      toVersion === versionRule.to ||
      (versionRule.to === 'v9+' && ['v9', 'v10+'].includes(toVersion)) ||
      (versionRule.to === 'v10+' && toVersion === 'v10+')

    return fromMatch && toMatch
  }

  /**
   * 應用版本轉換規則
   */
  private applyVersionRule(code: string, rule: VersionRule): string {
    const pattern =
      typeof rule.pattern === 'string'
        ? new RegExp(rule.pattern, 'g')
        : rule.pattern

    return code.replace(pattern, rule.replacement)
  }

  /**
   * 智能版本選擇
   */
  async selectOptimalVersion(code: string): Promise<string> {
    const detectedVersion = await this.detectVersion(code)

    // 如果已經是最新版本，直接返回
    if (detectedVersion === 'v10+') {
      return 'v10+'
    }

    // 檢查是否有複雜的語法需要特定版本
    const complexFeatures = this.detectComplexFeatures(code)

    if (complexFeatures.length > 0) {
      // 如果有複雜功能，建議使用最新版本
      return 'v10+'
    }

    // 如果是非常簡單的圖表且沒有複雜功能，可以使用 v9
    const verySimplePatterns = [
      /^flowchart\s+(TD|TB|BT|RL|LR)\s*\n\s*\w+\s*-->\s*\w+\s*$/m,
    ]

    const isVerySimple =
      verySimplePatterns.some(pattern => pattern.test(code.trim())) &&
      complexFeatures.length === 0 &&
      !code.includes('%%{init:') &&
      !code.includes('click ') &&
      !code.includes('style ') &&
      !code.includes('classDef ')

    return isVerySimple ? 'v9' : 'v10+'
  }

  /**
   * 檢測複雜功能
   */
  private detectComplexFeatures(code: string): string[] {
    const complexFeatures: string[] = []

    const featurePatterns = [
      { name: '互動功能', pattern: /click\s+\w+/i },
      { name: '主題配置', pattern: /%%{init:\s*{/i },
      { name: '自訂樣式', pattern: /style\s+\w+/i },
      { name: '類別定義', pattern: /classDef\s+\w+/i },
      { name: '子圖表', pattern: /subgraph\s+/i },
    ]

    for (const feature of featurePatterns) {
      if (feature.pattern.test(code)) {
        complexFeatures.push(feature.name)
      }
    }

    return complexFeatures
  }

  /**
   * 取得版本相容性警告
   */
  async getCompatibilityWarnings(code: string): Promise<string[]> {
    const warnings: string[] = []
    const detectedVersion = await this.detectVersion(code)

    if (!detectedVersion) {
      warnings.push('無法確定 Mermaid 版本，建議明確指定版本')
      return warnings
    }

    if (detectedVersion === 'v8') {
      warnings.push(
        '使用的是舊版 Mermaid 語法，建議升級到最新版本以獲得更好的功能支援'
      )
      warnings.push('graph 語法已被 flowchart 取代')
      warnings.push('大括號語法已不推薦使用')
    }

    if (detectedVersion === 'v9') {
      warnings.push('考慮升級到 v10+ 以獲得最新功能和更好的效能')
    }

    // 檢查混合語法
    const versionConflicts = this.detectVersionConflicts(code)
    if (versionConflicts.length > 0) {
      warnings.push('檢測到混合版本語法，可能造成渲染問題')
    }

    return warnings
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
   * 新增自訂版本規則
   */
  addVersionRule(from: string, to: string, rule: VersionRule): void {
    let compatibility = this.versionRules.find(
      vc => vc.from === from && vc.to === to
    )

    if (!compatibility) {
      compatibility = { from, to, rules: [] }
      this.versionRules.push(compatibility)
    }

    compatibility.rules.push(rule)

    // 按優先級排序
    compatibility.rules.sort((a, b) => a.priority - b.priority)
  }

  /**
   * 取得支援的版本清單
   */
  getSupportedVersions(): string[] {
    return Array.from(this.versionDetectionPatterns.keys())
  }

  /**
   * 檢查版本是否受支援
   */
  isVersionSupported(version: string): boolean {
    return this.versionDetectionPatterns.has(version)
  }
}
