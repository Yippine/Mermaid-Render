import { SyntaxAnalyzer } from '../SyntaxAnalyzer'
import { ToleranceConfig } from '../types'

describe('SyntaxAnalyzer', () => {
  let analyzer: SyntaxAnalyzer

  beforeEach(() => {
    analyzer = new SyntaxAnalyzer()
  })

  describe('基本語法分析', () => {
    it('應該正確分析有效的 Mermaid 程式碼', async () => {
      const validCode = `
        flowchart TD
        A[開始] --> B[處理]
        B --> C[結束]
      `

      const result = await analyzer.analyze(validCode)

      expect(result.success).toBe(true)
      expect(result.originalCode).toBe(validCode)
      expect(result.errors).toHaveLength(0)
      expect(result.fixes).toHaveLength(0)
      expect(result.tolerance.score).toBeGreaterThan(0.8)
      expect(result.metadata.chartType).toBe('flowchart')
    })

    it('應該檢測到缺少引號的錯誤', async () => {
      const codeWithMissingQuotes = `
        flowchart TD
        A[Node with spaces] --> B[Another node]
        B --> C[結束]
      `

      const result = await analyzer.analyze(codeWithMissingQuotes)

      expect(result.errors.length).toBeGreaterThan(0)
      const quotesError = result.errors.find(e => e.type === 'missing-quotes')
      expect(quotesError).toBeDefined()
      expect(quotesError?.fixable).toBe(true)
    })

    it('應該檢測到無效的節點 ID', async () => {
      const codeWithInvalidId = `
        flowchart TD
        123[開始] --> class[處理]
        class --> if[結束]
      `

      const result = await analyzer.analyze(codeWithInvalidId)

      const invalidIdErrors = result.errors.filter(
        e => e.type === 'invalid-node-id'
      )
      expect(invalidIdErrors.length).toBeGreaterThan(0)
    })
  })

  describe('錯誤修復', () => {
    it('應該能夠修復缺少引號的問題', async () => {
      const codeWithIssues = `
        flowchart TD
        A[Node with spaces] --> B[Another node with more spaces]
      `

      const result = await analyzer.analyze(codeWithIssues)

      expect(result.fixedCode).toBeDefined()
      expect(result.fixes.length).toBeGreaterThan(0)

      const fixedCode = result.fixedCode!
      expect(fixedCode).toContain('["Node with spaces"]')
      expect(fixedCode).toContain('["Another node with more spaces"]')
    })

    it('應該能夠修復無效的節點 ID', async () => {
      const codeWithInvalidId = `
        flowchart TD
        123[開始] --> B[處理]
      `

      const result = await analyzer.analyze(codeWithInvalidId)

      expect(result.fixedCode).toBeDefined()
      expect(result.fixes.length).toBeGreaterThan(0)

      const nodeIdFix = result.fixes.find(f => f.type === 'fix-node-id')
      expect(nodeIdFix).toBeDefined()
      expect(nodeIdFix?.fixed).toMatch(/^node\d+/)
    })
  })

  describe('容錯配置', () => {
    it('嚴格模式應該報告更多錯誤', async () => {
      const strictConfig: ToleranceConfig = {
        level: 'strict',
        enableAutoFix: true,
        enableVersionCompatibility: true,
        customRules: [],
        ignoredErrors: [],
      }

      const analyzer = new SyntaxAnalyzer(strictConfig)
      const code = `
        flowchart TD
        A[Node] --> B
        B->C[End]
      `

      const result = await analyzer.analyze(code)

      expect(result.tolerance.level).toBe('strict')
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('寬鬆模式應該有更高的容錯分數', async () => {
      const relaxedConfig: ToleranceConfig = {
        level: 'relaxed',
        enableAutoFix: true,
        enableVersionCompatibility: true,
        customRules: [],
        ignoredErrors: [],
      }

      const analyzer = new SyntaxAnalyzer(relaxedConfig)
      const code = `
        flowchart TD
        A[Node] --> B
        B->C[End]
      `

      const result = await analyzer.analyze(code)

      expect(result.tolerance.level).toBe('relaxed')
      expect(result.tolerance.score).toBeGreaterThan(0.6)
    })

    it('應該能夠忽略指定的錯誤類型', async () => {
      const configWithIgnored: ToleranceConfig = {
        level: 'standard',
        enableAutoFix: true,
        enableVersionCompatibility: true,
        customRules: [],
        ignoredErrors: ['missing-quotes'],
      }

      const analyzer = new SyntaxAnalyzer(configWithIgnored)
      const code = `
        flowchart TD
        A[Node with spaces] --> B[Another node]
      `

      const result = await analyzer.analyze(code)

      const quotesErrors = result.errors.filter(
        e => e.type === 'missing-quotes'
      )
      expect(quotesErrors).toHaveLength(0)
    })
  })

  describe('語法健康度計算', () => {
    it('應該正確計算語法健康度', async () => {
      const code = `
        flowchart TD
        A[開始] --> B[處理]
        B --> C[結束]
      `

      const result = await analyzer.analyze(code)
      const health = analyzer.calculateSyntaxHealth(result)

      expect(health.score).toBeGreaterThan(0.8)
      expect(health.issues.critical).toBe(0)
      expect(health.totalIssues).toBe(0)
      expect(health.recommendation).toBe('語法良好')
    })

    it('應該正確識別問題並給出建議', async () => {
      const problematicCode = `
        flowchart TD
        123[開始] --> B
        B --> undefined_node
      `

      const result = await analyzer.analyze(problematicCode)
      const health = analyzer.calculateSyntaxHealth(result)

      expect(health.score).toBeLessThan(0.7)
      expect(health.issues.critical).toBeGreaterThan(0)
      expect(health.recommendation).toContain('修復')
    })
  })

  describe('版本相容性', () => {
    it('應該檢測版本相容性問題', async () => {
      const v8Code = `
        graph TD
        A --> B
        B --> C
      `

      const result = await analyzer.analyze(v8Code)

      expect(result.metadata.version).toBe('v8')
      const versionErrors = result.errors.filter(
        e => e.type === 'version-incompatibility'
      )
      expect(versionErrors.length).toBeGreaterThan(0)
    })
  })

  describe('錯誤處理', () => {
    it('應該處理空白程式碼', async () => {
      const emptyCode = ''

      const result = await analyzer.analyze(emptyCode)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('malformed-syntax')
    })

    it('應該處理無效的程式碼', async () => {
      const invalidCode = '@@#$%^&*('

      const result = await analyzer.analyze(invalidCode)

      expect(result.success).toBe(false)
      expect(result.tolerance.score).toBe(0)
    })
  })

  describe('效能測試', () => {
    it('應該在合理時間內完成分析', async () => {
      const largeCode = Array.from(
        { length: 100 },
        (_, i) => `A${i}[Node ${i}] --> A${i + 1}[Node ${i + 1}]`
      ).join('\n')

      const startTime = performance.now()
      const result = await analyzer.analyze(largeCode)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 應該在 1 秒內完成
      expect(result.metadata.processingTime).toBeLessThan(1000)
    })
  })

  describe('自訂規則', () => {
    it('應該能夠應用自訂規則', async () => {
      const customRules = [
        {
          id: 'test-rule',
          name: '測試規則',
          pattern: 'TEST',
          replacement: 'PASSED',
          priority: 1,
          enabled: true,
          description: '測試用自訂規則',
        },
      ]

      const configWithCustomRules: ToleranceConfig = {
        level: 'standard',
        enableAutoFix: true,
        enableVersionCompatibility: true,
        customRules,
        ignoredErrors: [],
      }

      const analyzer = new SyntaxAnalyzer(configWithCustomRules)
      const code = `
        flowchart TD
        A[TEST] --> B[Node]
      `

      const result = await analyzer.analyze(code)

      const customRuleErrors = result.errors.filter(e =>
        e.message.includes('自訂規則')
      )
      expect(customRuleErrors.length).toBeGreaterThan(0)
    })
  })
})
