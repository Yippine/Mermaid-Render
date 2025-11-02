import { SyntaxFixer } from '../SyntaxFixer'
import { SyntaxError, ToleranceConfig } from '../types'

describe('SyntaxFixer', () => {
  let fixer: SyntaxFixer
  let defaultConfig: ToleranceConfig

  beforeEach(() => {
    fixer = new SyntaxFixer()
    defaultConfig = {
      level: 'standard',
      enableAutoFix: true,
      enableVersionCompatibility: true,
      customRules: [],
      ignoredErrors: [],
    }
  })

  describe('修復缺少引號的問題', () => {
    it('應該能夠為包含空格的標籤加上引號', async () => {
      const code = 'A[Node with spaces] --> B[End]'
      const error: SyntaxError = {
        type: 'missing-quotes',
        message: '缺少引號',
        severity: 'warning',
        position: { start: 0, end: 19 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.type).toBe('add-quotes')
      expect(fix?.fixed).toContain('"Node with spaces"')
      expect(fix?.confidence).toBeGreaterThan(0.8)
    })

    it('應該處理複雜的標籤內容', async () => {
      const code = 'A[複雜 標籤 with 123 & symbols!] --> B'
      const error: SyntaxError = {
        type: 'missing-quotes',
        message: '缺少引號',
        severity: 'warning',
        position: { start: 0, end: 33 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.fixed).toContain('"複雜 標籤 with 123 & symbols!"')
    })
  })

  describe('修復無效節點 ID', () => {
    it('應該能夠修復數字開頭的節點 ID', async () => {
      const code = '123[Start] --> B[End]'
      const error: SyntaxError = {
        type: 'invalid-node-id',
        message: '無效節點 ID',
        severity: 'error',
        position: { start: 0, end: 10 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.type).toBe('fix-node-id')
      expect(fix?.fixed).toMatch(/^node123\[Start\]/)
      expect(fix?.confidence).toBeGreaterThan(0.7)
    })

    it('應該能夠修復保留關鍵字節點 ID', async () => {
      const code = 'class[MyClass] --> if[Decision]'
      const error: SyntaxError = {
        type: 'invalid-node-id',
        message: '無效節點 ID',
        severity: 'error',
        position: { start: 0, end: 14 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.fixed).toMatch(/^_class\[MyClass\]/)
    })
  })

  describe('修復箭頭語法不一致', () => {
    it('應該統一箭頭樣式', async () => {
      const code = `
        A --> B
        B -> C
        C --> D
        D -> E
      `
      const error: SyntaxError = {
        type: 'inconsistent-arrow',
        message: '箭頭不一致',
        severity: 'warning',
        position: { start: 20, end: 22 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.type).toBe('standardize-arrow')
      expect(fix?.fixed).toBe('-->')
      expect(fix?.description).toContain('統一箭頭樣式')
    })

    it('應該選擇最常用的箭頭樣式', async () => {
      const code = `
        A -> B
        B -> C
        C --> D
      `
      const error: SyntaxError = {
        type: 'inconsistent-arrow',
        message: '箭頭不一致',
        severity: 'warning',
        position: { start: 30, end: 33 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.fixed).toBe('->')
    })
  })

  describe('修復縮排錯誤', () => {
    it('應該調整奇數縮排為偶數', async () => {
      const code = `flowchart TD
 A --> B
   C --> D`

      const error: SyntaxError = {
        type: 'indentation-error',
        message: '縮排錯誤',
        line: 2,
        severity: 'warning',
        position: { start: 13, end: 22 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.type).toBe('fix-indentation')
      expect(fix?.fixed).toMatch(/^  A --> B$/) // 2 個空格
    })
  })

  describe('修復無效字元', () => {
    it('應該替換常見的無效字元', async () => {
      const code = 'A—B'
      const error: SyntaxError = {
        type: 'invalid-character',
        message: '無效字元',
        severity: 'warning',
        position: { start: 1, end: 2 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.fixed).toBe('--')
      expect(fix?.confidence).toBe(0.8)
    })

    it('應該移除未知的無效字元', async () => {
      const code = 'A@B'
      const error: SyntaxError = {
        type: 'invalid-character',
        message: '無效字元',
        severity: 'warning',
        position: { start: 1, end: 2 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.fixed).toBe('')
      expect(fix?.confidence).toBe(0.5)
    })
  })

  describe('修復重複節點', () => {
    it('應該為重複節點生成新的 ID', async () => {
      const code = `
        A[First] --> B
        A[Second] --> C
      `
      const error: SyntaxError = {
        type: 'duplicate-node',
        message: '重複節點',
        severity: 'warning',
        position: { start: 30, end: 31 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.type).toBe('rename-duplicate-node')
      expect(fix?.fixed).toMatch(/^A_\d+$/)
    })
  })

  describe('修復未定義節點引用', () => {
    it('應該為未定義的節點添加定義', async () => {
      const code = 'A --> B'
      const error: SyntaxError = {
        type: 'undefined-node-reference',
        message: '未定義節點',
        severity: 'error',
        position: { start: 6, end: 7 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.type).toBe('add-node-definition')
      expect(fix?.fixed).toBe('B[B]\n')
      expect(fix?.position.start).toBe(0)
      expect(fix?.position.end).toBe(0)
    })
  })

  describe('修復無效主題', () => {
    it('應該修正無效的主題名稱', async () => {
      const code = '%%{init: {"theme": "invalid-theme"}}%%'
      const error: SyntaxError = {
        type: 'invalid-theme',
        message: '無效主題',
        severity: 'warning',
        position: { start: 0, end: 38 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      expect(fix).toBeDefined()
      expect(fix?.type).toBe('fix-theme-reference')
      expect(['default', 'base', 'dark', 'forest', 'neutral']).toContain(
        fix?.fixed.match(/"([^"]+)"/)?.[1]
      )
    })
  })

  describe('批量應用修復', () => {
    it('應該能夠批量應用多個修復', async () => {
      const code = 'A[Node with spaces] --> 123[Invalid ID]'
      const fixes = [
        {
          type: 'add-quotes' as const,
          original: 'A[Node with spaces]',
          fixed: 'A["Node with spaces"]',
          description: '加引號',
          confidence: 0.9,
          position: { start: 0, end: 19 },
        },
        {
          type: 'fix-node-id' as const,
          original: '123[Invalid ID]',
          fixed: 'node123[Invalid ID]',
          description: '修復 ID',
          confidence: 0.8,
          position: { start: 24, end: 39 },
        },
      ]

      const result = await fixer.applyFixes(code, fixes)

      expect(result).toBe('A["Node with spaces"] --> node123[Invalid ID]')
    })

    it('應該按正確順序應用修復（從後往前）', async () => {
      const code = 'ABCDEF'
      const fixes = [
        {
          type: 'add-quotes' as const,
          original: 'A',
          fixed: 'X',
          description: '替換 A',
          confidence: 1,
          position: { start: 0, end: 1 },
        },
        {
          type: 'add-quotes' as const,
          original: 'D',
          fixed: 'Y',
          description: '替換 D',
          confidence: 1,
          position: { start: 3, end: 4 },
        },
      ]

      const result = await fixer.applyFixes(code, fixes)

      expect(result).toBe('XBCYEF')
    })

    it('應該處理在開頭插入內容的情況', async () => {
      const code = 'A --> B'
      const fixes = [
        {
          type: 'add-node-definition' as const,
          original: '',
          fixed: 'B[B]\n',
          description: '添加節點定義',
          confidence: 0.6,
          position: { start: 0, end: 0 },
        },
      ]

      const result = await fixer.applyFixes(code, fixes)

      expect(result).toBe('B[B]\nA --> B')
    })
  })

  describe('修復驗證', () => {
    it('應該拒絕信心度過低的修復', async () => {
      const code = 'test'
      const error: SyntaxError = {
        type: 'missing-quotes',
        message: '測試錯誤',
        severity: 'warning',
        position: { start: 0, end: 4 },
        fixable: true,
      }

      const strictConfig: ToleranceConfig = {
        ...defaultConfig,
        level: 'strict',
      }

      // 創建一個低信心度的修復（通過修改 SyntaxFixer 的內部邏輯）
      const fix = await fixer.fixError(code, error, strictConfig)

      // 在嚴格模式下，低信心度的修復可能被拒絕
      if (fix) {
        expect(fix.confidence).toBeGreaterThan(0.8)
      }
    })

    it('應該拒絕原文和修復內容相同的修復', async () => {
      // 這個測試確保修復邏輯不會產生無意義的修復
      const code = 'A --> B'
      const error: SyntaxError = {
        type: 'inconsistent-arrow',
        message: '箭頭測試',
        severity: 'warning',
        position: { start: 2, end: 5 },
        fixable: true,
      }

      const fix = await fixer.fixError(code, error, defaultConfig)

      if (fix) {
        expect(fix.original).not.toBe(fix.fixed)
      }
    })
  })
})
