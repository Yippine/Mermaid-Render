import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EditorStore {
  // State
  code: string
  theme: 'light' | 'dark'
  panelRatio: number
  isPreviewCollapsed: boolean
  isEditorCollapsed: boolean
  isLoading: boolean
  error: string | null

  // Actions
  updateCode: (code: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  setPanelRatio: (ratio: number) => void
  togglePreview: () => void
  toggleEditor: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetPanels: () => void
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // Initial state
      code: `graph TD
    A[開始] --> B[處理資料]
    B --> C{判斷條件}
    C -->|是| D[執行操作]
    C -->|否| E[跳過操作]
    D --> F[結束]
    E --> F`,
      theme: 'dark',
      panelRatio: 0.5,
      isPreviewCollapsed: false,
      isEditorCollapsed: false,
      isLoading: false,
      error: null,

      // Actions
      updateCode: (code: string) => {
        set({ code, error: null })
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
      },

      setPanelRatio: (ratio: number) => {
        // 確保比例在合理範圍內 (20%-80%)
        const clampedRatio = Math.max(0.2, Math.min(0.8, ratio))
        set({ panelRatio: clampedRatio })
      },

      togglePreview: () => {
        const { isPreviewCollapsed, isEditorCollapsed } = get()
        if (isPreviewCollapsed && isEditorCollapsed) {
          // 如果兩個都收起來，只展開預覽
          set({ isPreviewCollapsed: false })
        } else {
          set({ isPreviewCollapsed: !isPreviewCollapsed })
        }
      },

      toggleEditor: () => {
        const { isEditorCollapsed, isPreviewCollapsed } = get()
        if (isEditorCollapsed && isPreviewCollapsed) {
          // 如果兩個都收起來，只展開編輯器
          set({ isEditorCollapsed: false })
        } else {
          set({ isEditorCollapsed: !isEditorCollapsed })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      resetPanels: () => {
        set({
          panelRatio: 0.5,
          isPreviewCollapsed: false,
          isEditorCollapsed: false,
        })
      },
    }),
    {
      name: 'mermaid-editor-store',
      partialize: state => ({
        theme: state.theme,
        panelRatio: state.panelRatio,
        code: state.code,
      }),
    }
  )
)
