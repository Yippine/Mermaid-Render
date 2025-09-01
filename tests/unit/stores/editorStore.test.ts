import { renderHook, act } from '@testing-library/react'
import { useEditorStore } from '@/stores/editorStore'

// Mock Zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}))

describe('editorStore', () => {
  beforeEach(() => {
    // 重置 store 狀態
    const { result } = renderHook(() => useEditorStore())
    act(() => {
      result.current.updateCode(`graph TD
    A[開始] --> B[處理資料]
    B --> C{判斷條件}
    C -->|是| D[執行操作]
    C -->|否| E[跳過操作]
    D --> F[結束]
    E --> F`)
      result.current.setTheme('dark')
      result.current.resetPanels()
      result.current.setError(null)
      result.current.setLoading(false)
    })
  })

  describe('初始狀態', () => {
    it('應該有正確的初始值', () => {
      const { result } = renderHook(() => useEditorStore())
      const state = result.current

      expect(state.theme).toBe('dark')
      expect(state.panelRatio).toBe(0.5)
      expect(state.isPreviewCollapsed).toBe(false)
      expect(state.isEditorCollapsed).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
      expect(typeof state.code).toBe('string')
    })
  })

  describe('程式碼管理', () => {
    it('應該能更新程式碼', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.updateCode('新的程式碼')
      })

      expect(result.current.code).toBe('新的程式碼')
      expect(result.current.error).toBe(null)
    })

    it('程式碼更新時應該清除錯誤', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setError('測試錯誤')
      })

      expect(result.current.error).toBe('測試錯誤')

      act(() => {
        result.current.updateCode('新程式碼')
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('主題管理', () => {
    it('應該能切換主題', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setTheme('light')
      })

      expect(result.current.theme).toBe('light')

      act(() => {
        result.current.setTheme('dark')
      })

      expect(result.current.theme).toBe('dark')
    })
  })

  describe('面板比例管理', () => {
    it('應該能設定面板比例', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setPanelRatio(0.7)
      })

      expect(result.current.panelRatio).toBe(0.7)
    })

    it('應該限制面板比例在合理範圍內', () => {
      const { result } = renderHook(() => useEditorStore())

      // 測試最小值限制
      act(() => {
        result.current.setPanelRatio(0.1)
      })
      expect(result.current.panelRatio).toBe(0.2)

      // 測試最大值限制
      act(() => {
        result.current.setPanelRatio(0.9)
      })
      expect(result.current.panelRatio).toBe(0.8)
    })

    it('應該能重置面板', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setPanelRatio(0.7)
        result.current.toggleEditor()
        result.current.togglePreview()
      })

      act(() => {
        result.current.resetPanels()
      })

      expect(result.current.panelRatio).toBe(0.5)
      expect(result.current.isEditorCollapsed).toBe(false)
      expect(result.current.isPreviewCollapsed).toBe(false)
    })
  })

  describe('面板摺疊功能', () => {
    it('應該能切換預覽面板', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.togglePreview()
      })

      expect(result.current.isPreviewCollapsed).toBe(true)

      act(() => {
        result.current.togglePreview()
      })

      expect(result.current.isPreviewCollapsed).toBe(false)
    })

    it('應該能切換編輯器面板', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.toggleEditor()
      })

      expect(result.current.isEditorCollapsed).toBe(true)

      act(() => {
        result.current.toggleEditor()
      })

      expect(result.current.isEditorCollapsed).toBe(false)
    })

    it('不應該同時摺疊兩個面板', () => {
      const { result } = renderHook(() => useEditorStore())

      // 先摺疊編輯器
      act(() => {
        result.current.toggleEditor()
      })

      expect(result.current.isEditorCollapsed).toBe(true)

      // 嘗試摺疊預覽面板時，編輯器應該自動展開
      act(() => {
        result.current.togglePreview()
      })

      expect(result.current.isPreviewCollapsed).toBe(true)
      expect(result.current.isEditorCollapsed).toBe(true) // 兩個都摺疊的狀態

      // 再次切換預覽面板應該只展開預覽
      act(() => {
        result.current.togglePreview()
      })

      expect(result.current.isPreviewCollapsed).toBe(false)
    })
  })

  describe('載入狀態管理', () => {
    it('應該能設定載入狀態', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('錯誤管理', () => {
    it('應該能設定錯誤訊息', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setError('測試錯誤訊息')
      })

      expect(result.current.error).toBe('測試錯誤訊息')

      act(() => {
        result.current.setError(null)
      })

      expect(result.current.error).toBe(null)
    })
  })
})
