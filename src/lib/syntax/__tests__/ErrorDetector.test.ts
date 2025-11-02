import { ErrorDetector } from '../ErrorDetector'
import { CustomRule } from '../types'

describe('ErrorDetector', () => {
  let detector: ErrorDetector

  beforeEach(() => {
    detector = new ErrorDetector()
  })

  describe('基本錯誤檢測', () => {
    it('應該檢測到空白程式碼', async () => {
      const emptyCode = ''
      const errors = await detector.detectBasicErrors(emptyCode)

      expect(errors).toHaveLength(1)
      expect(errors[0].type).toBe('malformed-syntax')
      expect(errors[0].message).toBe('程式碼內容為空')
      expect(errors[0].severity).toBe('error')
      expect(errors[0].fixable).toBe(false)
    })

    it('應該檢測到缺少引號的節點標籤', async () => {
      const code = `
        flowchart TD
        A[Node with spaces] --> B[Another node with spaces]
        C["Quoted node"] --> D[End]
      `

      const errors = await detector.detectBasicErrors(code)
      const quoteErrors = errors.filter(e => e.type === 'missing-quotes')

      expect(quoteErrors.length).toBeGreaterThan(0)
      expect(quoteErrors[0].severity).toBe('warning')
      expect(quoteErrors[0].fixable).toBe(true)
      expect(quoteErrors[0].suggestion).toContain('引號')
    })

    it('應該檢測到無效的節點 ID', async () => {
      const code = `
        flowchart TD
        123[開始] --> class[中間] --> if[結束]
        456[Another] --> for[Loop]
      `

      const errors = await detector.detectBasicErrors(code)
      const idErrors = errors.filter(e => e.type === 'invalid-node-id')

      expect(idErrors.length).toBeGreaterThanOrEqual(4) // 123, class, if, for
      expect(idErrors[0].severity).toBe('error')
      expect(idErrors[0].fixable).toBe(true)
    })

    it('應該檢測到縮排錯誤', async () => {
      const code = `flowchart TD
 A --> B
   C --> D
     E --> F`

      const errors = await detector.detectBasicErrors(code)
      const indentErrors = errors.filter(e => e.type === 'indentation-error')

      expect(indentErrors.length).toBeGreaterThan(0)
      expect(indentErrors[0].severity).toBe('warning')
      expect(indentErrors[0].fixable).toBe(true)
    })

    it('應該檢測到無效字元', async () => {
      const code = `
        flowchart TD
        A[節點】 --> B[另一個節點]
        C["Curly quotes"] --> D[Normal]
      `

      const errors = await detector.detectBasicErrors(code)
      const charErrors = errors.filter(e => e.type === 'invalid-character')

      expect(charErrors.length).toBeGreaterThan(0)
      expect(charErrors[0].severity).toBe('warning')
      expect(charErrors[0].fixable).toBe(true)
    })

    it('應該檢測到未定義的節點引用', async () => {
      const code = `
        flowchart TD
        A[開始] --> B
        C --> D[結束]
      `

      const errors = await detector.detectBasicErrors(code)
      const undefErrors = errors.filter(
        e => e.type === 'undefined-node-reference'
      )

      expect(undefErrors.length).toBeGreaterThanOrEqual(2) // B 和 C 未定義
      expect(undefErrors[0].severity).toBe('error')
      expect(undefErrors[0].fixable).toBe(true)
    })

    it('應該檢測到重複節點定義', async () => {
      const code = `
        flowchart TD
        A[第一個 A] --> B[Node B]
        A[第二個 A] --> C[Node C]
        B[Another B] --> D[End]
      `

      const errors = await detector.detectBasicErrors(code)
      const duplicateErrors = errors.filter(e => e.type === 'duplicate-node')

      expect(duplicateErrors.length).toBeGreaterThanOrEqual(2) // A 和 B 重複
      expect(duplicateErrors[0].severity).toBe('warning')
      expect(duplicateErrors[0].fixable).toBe(true)
    })
  })

  describe('進階錯誤檢測', () => {
    it('應該檢測到循環引用', async () => {
      const code = `
        flowchart TD
        A --> B
        B --> C
        C --> A
        D --> E
        E --> D
      `

      const errors = await detector.detectAdvancedErrors(code)
      const circularErrors = errors.filter(e => e.type === 'circular-reference')

      expect(circularErrors.length).toBeGreaterThan(0)
      expect(circularErrors[0].severity).toBe('warning')
      expect(circularErrors[0].fixable).toBe(false)
    })

    it('應該檢測到未知指令', async () => {
      const code = `
        unknowndiagram TD
        A --> B
        B --> C
      `

      const errors = await detector.detectAdvancedErrors(code)
      const unknownErrors = errors.filter(e => e.type === 'unknown-directive')

      expect(unknownErrors.length).toBeGreaterThan(0)
      expect(unknownErrors[0].severity).toBe('warning')
      expect(unknownErrors[0].fixable).toBe(false)
    })

    it('應該檢測到無效主題引用', async () => {
      const code = `
        %%{init: {"theme": "invalid-theme"}}%%
        flowchart TD
        A --> B
      `

      const errors = await detector.detectAdvancedErrors(code)
      const themeErrors = errors.filter(e => e.type === 'invalid-theme')

      expect(themeErrors.length).toBeGreaterThan(0)
      expect(themeErrors[0].severity).toBe('warning')
      expect(themeErrors[0].fixable).toBe(true)
    })
  })

  describe('自訂規則檢測', () => {
    it('應該能夠應用自訂規則', async () => {
      const customRules: CustomRule[] = [
        {
          id: 'no-uppercase',
          name: '禁止大寫標籤',
          pattern: /\[([A-Z]+)\]/g,
          replacement: '[$1]',
          priority: 1,
          enabled: true,
          description: '節點標籤不應全部大寫',
        },
        {
          id: 'require-prefix',
          name: '需要節點前綴',
          pattern: /^(?!node_)(\w+)\[/gm,
          replacement: 'node_$1[',
          priority: 2,
          enabled: true,
          description: '所有節點 ID 都應該有 node_ 前綴',
        },
      ]

      const code = `
        flowchart TD
        A[UPPERCASE] --> B[lowercase]
        test[Another] --> end[End]
      `

      const errors = await detector.detectCustomRuleViolations(
        code,
        customRules
      )

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].type).toBe('malformed-syntax')
      expect(errors[0].message).toContain('自訂規則')
      expect(errors[0].severity).toBe('warning')
      expect(errors[0].fixable).toBe(true)
    })

    it('應該忽略停用的自訂規則', async () => {
      const customRules: CustomRule[] = [
        {
          id: 'disabled-rule',
          name: '停用規則',
          pattern: /test/g,
          replacement: 'TEST',
          priority: 1,
          enabled: false,
          description: '這個規則被停用了',
        },
      ]

      const code = 'test content with test keyword'
      const errors = await detector.detectCustomRuleViolations(
        code,
        customRules
      )

      expect(errors).toHaveLength(0)
    })
  })

  describe('錯誤位置資訊', () => {
    it('應該正確計算行和列位置', async () => {
      const code = `flowchart TD
A[Node] --> B
123[Invalid] --> C
D --> undefined_node`

      const errors = await detector.detectBasicErrors(code)
      const invalidIdError = errors.find(e => e.type === 'invalid-node-id')

      expect(invalidIdError).toBeDefined()
      expect(invalidIdError?.line).toBe(3) // 第三行
      expect(invalidIdError?.column).toBeGreaterThan(0)
    })

    it('應該正確設定錯誤位置範圍', async () => {
      const code = 'A[Node with spaces] --> B[End]'
      const errors = await detector.detectBasicErrors(code)
      const quotesError = errors.find(e => e.type === 'missing-quotes')

      expect(quotesError).toBeDefined()
      expect(quotesError?.position.start).toBeGreaterThanOrEqual(0)
      expect(quotesError?.position.end).toBeGreaterThan(
        quotesError?.position.start || 0
      )
    })
  })

  describe('錯誤建議', () => {
    it('應該為缺少引號提供正確建議', async () => {
      const code = 'A[Node with spaces] --> B'
      const errors = await detector.detectBasicErrors(code)
      const quotesError = errors.find(e => e.type === 'missing-quotes')

      expect(quotesError?.suggestion).toBe('在節點標籤加上引號')
    })

    it('應該為無效節點 ID 提供正確建議', async () => {
      const code = '123[Start] --> class[Middle]'
      const errors = await detector.detectBasicErrors(code)
      const idErrors = errors.filter(e => e.type === 'invalid-node-id')

      expect(idErrors.length).toBeGreaterThan(0)
      expect(idErrors[0].suggestion).toBe(
        '使用有效的節點 ID（字母開頭，避免保留字）'
      )
    })
  })
})
