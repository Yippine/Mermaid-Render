import {
  quickAnalyze,
  quickFix,
  detectMermaidVersion,
  convertMermaidVersion,
  checkSyntaxHealth,
  createSyntaxAnalyzer,
  DEFAULT_TOLERANCE_CONFIG,
} from '../index'

describe('語法容錯系統整合測試', () => {
  describe('快速分析功能', () => {
    it('應該能夠快速分析有效的 Mermaid 程式碼', async () => {
      const validCode = `
        flowchart TD
        A[開始] --> B[處理]
        B --> C[結束]
      `

      const result = await quickAnalyze(validCode)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.tolerance.score).toBeGreaterThan(0.8)
      expect(result.metadata.chartType).toBe('flowchart')
    })

    it('應該能夠快速分析並修復問題程式碼', async () => {
      const problematicCode = `
        flowchart TD
        123[開始] --> B[Node with spaces]
        class[處理] --> C[結束]
      `

      const result = await quickAnalyze(problematicCode)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.fixes.length).toBeGreaterThan(0)
      expect(result.fixedCode).toBeDefined()
    })
  })

  describe('快速修復功能', () => {
    it('應該能夠快速修復常見問題', async () => {
      const problematicCode = `
        flowchart TD
        A[Node with spaces] --> 123[Invalid ID]
        B -> C
        D --> E
      `

      const result = await quickFix(problematicCode)

      expect(result.success).toBe(false) // 因為還有其他問題
      expect(result.fixes.length).toBeGreaterThan(0)
      expect(result.fixedCode).toContain('"Node with spaces"')
      expect(result.fixedCode).toContain('node123')
    })

    it('應該能夠使用自訂配置進行快速修復', async () => {
      const code = `
        flowchart TD
        A[Node with spaces] --> B
      `

      const strictConfig = {
        level: 'strict' as const,
        enableAutoFix: true,
        enableVersionCompatibility: false,
      }

      const result = await quickFix(code, strictConfig)

      expect(result.fixes.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('版本檢測和轉換', () => {
    it('應該能夠檢測和轉換 Mermaid 版本', async () => {
      const v8Code = `
        graph TD
        A --> B
        subgraph "Processing" {
          C --> D
        }
      `

      const detectedVersion = await detectMermaidVersion(v8Code)
      expect(detectedVersion).toBe('v8')

      const convertedCode = await convertMermaidVersion(v8Code, 'v9+')
      expect(convertedCode).toContain('flowchart TD')
      expect(convertedCode).toContain('end')
      expect(convertedCode).not.toContain('graph TD')
    })

    it('應該處理無法檢測版本的情況', async () => {
      const unknownCode = 'random text'
      const version = await detectMermaidVersion(unknownCode)
      expect(version).toBeUndefined()

      const converted = await convertMermaidVersion(unknownCode, 'v10+')
      expect(converted).toBe(unknownCode)
    })
  })

  describe('語法健康度檢查', () => {
    it('應該為健康的程式碼提供高分', async () => {
      const healthyCode = `
        flowchart TD
        A[開始] --> B[處理]
        B --> C[結束]
      `

      const health = await checkSyntaxHealth(healthyCode)

      expect(health.score).toBeGreaterThan(0.8)
      expect(health.issues.critical).toBe(0)
      expect(health.issues.warnings).toBe(0)
      expect(health.recommendation).toBe('語法良好')
    })

    it('應該為有問題的程式碼提供詳細分析', async () => {
      const problematicCode = `
        flowchart TD
        123[開始] --> undefined_node
        class[處理] --> B[Node with spaces]
      `

      const health = await checkSyntaxHealth(problematicCode)

      expect(health.score).toBeLessThan(0.7)
      expect(health.issues.critical).toBeGreaterThan(0)
      expect(health.totalIssues).toBeGreaterThan(0)
      expect(health.fixableCount).toBeGreaterThan(0)
      expect(health.recommendation).toContain('修復')
    })
  })

  describe('完整工作流程測試', () => {
    it('應該能夠完成從檢測到修復的完整流程', async () => {
      // 1. 包含多種問題的複雜程式碼
      const complexProblematicCode = `
        graph TD
        123[開始節點 with spaces] --> class[處理]
        class -> if[決策 node]
        if --> B
        B --> undefined_reference
        duplicate[重複] --> C[結束]
        duplicate[另一個重複] --> D
      `

      // 2. 檢測版本
      const version = await detectMermaidVersion(complexProblematicCode)
      expect(version).toBe('v8')

      // 3. 分析問題
      const analysis = await quickAnalyze(complexProblematicCode)
      expect(analysis.success).toBe(false)
      expect(analysis.errors.length).toBeGreaterThan(3)

      // 4. 檢查健康度
      const health = await checkSyntaxHealth(complexProblematicCode)
      expect(health.score).toBeLessThan(0.5)

      // 5. 應用修復
      const fixResult = await quickFix(complexProblematicCode)
      expect(fixResult.fixes.length).toBeGreaterThan(0)

      // 6. 版本轉換
      const convertedCode = await convertMermaidVersion(
        fixResult.fixedCode,
        'v10+'
      )
      expect(convertedCode).toContain('flowchart TD')

      // 7. 驗證修復後的健康度
      const fixedHealth = await checkSyntaxHealth(convertedCode)
      expect(fixedHealth.score).toBeGreaterThan(health.score)
    })

    it('應該能夠處理邊界情況', async () => {
      const edgeCases = [
        '', // 空字串
        '   ', // 只有空格
        '%%註解%%', // 只有註解
        '123456789', // 純數字
        'A', // 單字元
      ]

      for (const code of edgeCases) {
        const analysis = await quickAnalyze(code)
        expect(analysis).toBeDefined()
        expect(analysis.originalCode).toBe(code)

        const health = await checkSyntaxHealth(code)
        expect(health).toBeDefined()
        expect(health.score).toBeGreaterThanOrEqual(0)
        expect(health.score).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('效能測試', () => {
    it('應該在合理時間內處理大型程式碼', async () => {
      // 生成大型程式碼（1000 行）
      const largeCode = Array.from(
        { length: 1000 },
        (_, i) => `A${i}[Node ${i}] --> A${i + 1}[Node ${i + 1}]`
      ).join('\n')

      const startTime = performance.now()

      const analysis = await quickAnalyze(largeCode)
      const health = await checkSyntaxHealth(largeCode)

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(totalTime).toBeLessThan(5000) // 應該在 5 秒內完成
      expect(analysis).toBeDefined()
      expect(health).toBeDefined()
    })

    it('應該能夠快速處理多個小型程式碼片段', async () => {
      const codeSnippets = Array.from(
        { length: 100 },
        (_, i) => `flowchart TD\nA${i} --> B${i}`
      )

      const startTime = performance.now()

      const results = await Promise.all(
        codeSnippets.map(code => quickAnalyze(code))
      )

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(totalTime).toBeLessThan(3000) // 應該在 3 秒內完成
      expect(results).toHaveLength(100)
      expect(results.every(r => r.success)).toBe(true)
    })
  })

  describe('配置測試', () => {
    it('應該使用預設配置', () => {
      const analyzer = createSyntaxAnalyzer()
      const config = analyzer.getConfig()

      expect(config.level).toBe(DEFAULT_TOLERANCE_CONFIG.level)
      expect(config.enableAutoFix).toBe(DEFAULT_TOLERANCE_CONFIG.enableAutoFix)
    })

    it('應該能夠覆蓋預設配置', () => {
      const customConfig = {
        level: 'strict' as const,
        enableAutoFix: false,
      }

      const analyzer = createSyntaxAnalyzer(customConfig)
      const config = analyzer.getConfig()

      expect(config.level).toBe('strict')
      expect(config.enableAutoFix).toBe(false)
      expect(config.enableVersionCompatibility).toBe(true) // 應該保留預設值
    })

    it('應該能夠動態更新配置', async () => {
      const analyzer = createSyntaxAnalyzer({ level: 'standard' })

      const code = `
        flowchart TD
        A[Node with spaces] --> B
      `

      // 使用標準模式分析
      const standardResult = await analyzer.analyze(code)

      // 更新為嚴格模式
      analyzer.updateConfig({ level: 'strict' })
      const strictResult = await analyzer.analyze(code)

      expect(standardResult.tolerance.level).toBe('standard')
      expect(strictResult.tolerance.level).toBe('strict')
      expect(strictResult.tolerance.score).toBeLessThanOrEqual(
        standardResult.tolerance.score
      )
    })
  })

  describe('錯誤恢復測試', () => {
    it('應該能夠從錯誤中恢復並提供有用資訊', async () => {
      const corruptedCode = '\uFEFF\u0000\u001F' // 包含無效 Unicode 字元

      const analysis = await quickAnalyze(corruptedCode)

      expect(analysis).toBeDefined()
      expect(analysis.success).toBe(false)
      expect(analysis.errors.length).toBeGreaterThan(0)
      expect(analysis.metadata.processingTime).toBeGreaterThan(0)
    })

    it('應該能夠處理極長的單行程式碼', async () => {
      const longLine = 'A'.repeat(10000) + '[Very long node label]'

      const analysis = await quickAnalyze(longLine)

      expect(analysis).toBeDefined()
      expect(analysis.originalCode).toBe(longLine)
    })
  })
})
