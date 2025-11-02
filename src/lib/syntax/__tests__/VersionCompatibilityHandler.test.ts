import { VersionCompatibilityHandler } from '../VersionCompatibilityHandler'

describe('VersionCompatibilityHandler', () => {
  let handler: VersionCompatibilityHandler

  beforeEach(() => {
    handler = new VersionCompatibilityHandler()
  })

  describe('版本檢測', () => {
    it('應該正確檢測 v8 版本語法', async () => {
      const v8Code = `
        graph TD
        A --> B
        subgraph "Sub Graph" {
          C --> D
        }
        style A fill:#f9f
      `

      const version = await handler.detectVersion(v8Code)
      expect(version).toBe('v8')
    })

    it('應該正確檢測 v9 版本語法', async () => {
      const v9Code = `
        flowchart TD
        A[Start] --> B[Process]
        subgraph "Processing"
          B --> C[Step 1]
          C --> D[Step 2]
        end
        classDef default fill:#e1f5fe
      `

      const version = await handler.detectVersion(v9Code)
      expect(version).toBe('v9')
    })

    it('應該正確檢測 v10+ 版本語法', async () => {
      const v10Code = `
        %%{init: {"theme": "base"}}%%
        flowchart TD
        A[Start] --> B[Process]
        click A "https://example.com" "Open Example" _blank
      `

      const version = await handler.detectVersion(v10Code)
      expect(version).toBe('v10+')
    })

    it('應該處理無法識別的版本', async () => {
      const unknownCode = `
        some random text
        that doesn't match any version
      `

      const version = await handler.detectVersion(unknownCode)
      expect(version).toBeUndefined()
    })

    it('應該處理混合版本語法', async () => {
      const mixedCode = `
        graph TD
        A --> B
        flowchart LR
        C --> D
      `

      const version = await handler.detectVersion(mixedCode)
      expect(version).toBeDefined()
    })
  })

  describe('相容性檢查', () => {
    it('應該檢測到版本衝突', async () => {
      const conflictCode = `
        graph TD
        A --> B
        flowchart LR
        C --> D
      `

      const errors = await handler.checkCompatibility(conflictCode)
      const conflictErrors = errors.filter(
        e => e.type === 'version-incompatibility'
      )

      expect(conflictErrors.length).toBeGreaterThan(0)
      expect(conflictErrors[0].message).toContain('混合版本語法')
      expect(conflictErrors[0].severity).toBe('warning')
      expect(conflictErrors[0].fixable).toBe(true)
    })

    it('應該檢測到過時的 v8 語法', async () => {
      const v8Code = `
        graph TD
        A --> B
        subgraph "Old Style" {
          C --> D
        }
      `

      const errors = await handler.checkCompatibility(v8Code)
      const deprecatedErrors = errors.filter(
        e => e.type === 'version-incompatibility'
      )

      expect(deprecatedErrors.length).toBeGreaterThan(0)
      expect(deprecatedErrors.some(e => e.message.includes('graph 語法'))).toBe(
        true
      )
    })

    it('應該處理沒有版本問題的程式碼', async () => {
      const cleanCode = `
        flowchart TD
        A[Start] --> B[End]
      `

      const errors = await handler.checkCompatibility(cleanCode)
      expect(errors).toHaveLength(0)
    })
  })

  describe('版本轉換', () => {
    it('應該將 v8 語法轉換為 v9+', async () => {
      const v8Code = `graph TD
A --> B
subgraph "Processing" {
  C --> D
}
style A fill:#f9f`

      const converted = await handler.convertToVersion(v8Code, 'v9+')

      expect(converted).toContain('flowchart TD')
      expect(converted).not.toContain('graph TD')
      expect(converted).toContain('end')
      expect(converted).not.toContain('{')
      expect(converted).not.toContain('}')
    })

    it('應該處理相同版本的轉換', async () => {
      const v9Code = `
        flowchart TD
        A --> B
      `

      const converted = await handler.convertToVersion(v9Code, 'v9')
      expect(converted).toBe(v9Code)
    })

    it('應該處理無法檢測版本的程式碼', async () => {
      const unknownCode = 'random text'
      const converted = await handler.convertToVersion(unknownCode, 'v10+')

      expect(converted).toBe(unknownCode)
    })

    it('應該按優先級應用轉換規則', async () => {
      const v8Code = `graph TD
A --> B
style A fill: #f9f, stroke: #333`

      const converted = await handler.convertToVersion(v8Code, 'v9+')

      expect(converted).toContain('flowchart TD')
      expect(converted).toContain('style A fill:#f9f')
    })
  })

  describe('智能版本選擇', () => {
    it('應該為簡單圖表選擇 v9', async () => {
      const simpleCode = `
        flowchart TD
        A --> B
        B --> C
      `

      const optimalVersion = await handler.selectOptimalVersion(simpleCode)
      expect(optimalVersion).toBe('v9')
    })

    it('應該為複雜功能選擇 v10+', async () => {
      const complexCode = `
        %%{init: {"theme": "base"}}%%
        flowchart TD
        A --> B
        click A "https://example.com" "Link" _blank
        style A fill:#f9f
        classDef default stroke:#333
      `

      const optimalVersion = await handler.selectOptimalVersion(complexCode)
      expect(optimalVersion).toBe('v10+')
    })

    it('應該為已經是最新版本的程式碼返回 v10+', async () => {
      const v10Code = `
        %%{init: {"theme": "base"}}%%
        flowchart TD
        A --> B
      `

      const optimalVersion = await handler.selectOptimalVersion(v10Code)
      expect(optimalVersion).toBe('v10+')
    })
  })

  describe('相容性警告', () => {
    it('應該為無法檢測版本的程式碼提供警告', async () => {
      const unknownCode = 'random content'
      const warnings = await handler.getCompatibilityWarnings(unknownCode)

      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings[0]).toContain('無法確定 Mermaid 版本')
    })

    it('應該為 v8 語法提供升級建議', async () => {
      const v8Code = `
        graph TD
        A --> B
      `

      const warnings = await handler.getCompatibilityWarnings(v8Code)

      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings.some(w => w.includes('舊版 Mermaid 語法'))).toBe(true)
      expect(
        warnings.some(w => w.includes('graph 語法已被 flowchart 取代'))
      ).toBe(true)
    })

    it('應該為混合版本語法提供警告', async () => {
      const mixedCode = `
        graph TD
        A --> B
        flowchart LR
        C --> D
      `

      const warnings = await handler.getCompatibilityWarnings(mixedCode)

      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings.some(w => w.includes('混合版本語法'))).toBe(true)
    })

    it('應該為 v9 提供升級建議', async () => {
      const v9Code = `
        flowchart TD
        A --> B
      `

      const warnings = await handler.getCompatibilityWarnings(v9Code)

      expect(warnings.some(w => w.includes('v10+'))).toBe(true)
    })
  })

  describe('自訂版本規則', () => {
    it('應該能夠新增自訂版本規則', () => {
      const customRule = {
        pattern: /old-syntax/g,
        replacement: 'new-syntax',
        description: '自訂轉換規則',
        priority: 1,
      }

      handler.addVersionRule('custom-v1', 'custom-v2', customRule)

      const supportedVersions = handler.getSupportedVersions()
      expect(supportedVersions).toContain('v8')
      expect(supportedVersions).toContain('v9')
      expect(supportedVersions).toContain('v10+')
    })

    it('應該檢查版本支援狀態', () => {
      expect(handler.isVersionSupported('v8')).toBe(true)
      expect(handler.isVersionSupported('v9')).toBe(true)
      expect(handler.isVersionSupported('v10+')).toBe(true)
      expect(handler.isVersionSupported('v99')).toBe(false)
    })
  })

  describe('複雜功能檢測', () => {
    it('應該檢測互動功能', async () => {
      const codeWithInteraction = `
        flowchart TD
        A --> B
        click A "https://example.com"
      `

      const version = await handler.selectOptimalVersion(codeWithInteraction)
      expect(version).toBe('v10+')
    })

    it('應該檢測主題配置', async () => {
      const codeWithTheme = `
        %%{init: {"theme": "dark"}}%%
        flowchart TD
        A --> B
      `

      const version = await handler.selectOptimalVersion(codeWithTheme)
      expect(version).toBe('v10+')
    })

    it('應該檢測子圖表', async () => {
      const codeWithSubgraph = `
        flowchart TD
        subgraph "Processing"
          A --> B
        end
      `

      const version = await handler.selectOptimalVersion(codeWithSubgraph)
      expect(version).toBe('v10+')
    })
  })
})
