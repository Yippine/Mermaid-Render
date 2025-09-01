/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '@/hooks/useTheme'
import { useEditorStore } from '@/stores/editorStore'

// Mock editor store
jest.mock('@/stores/editorStore')
const mockUseEditorStore = useEditorStore as jest.MockedFunction<
  typeof useEditorStore
>

// Mock matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

interface MockEditorStore {
  theme: string
  setTheme: jest.MockedFunction<(theme: string) => void>
}

describe('useTheme', () => {
  let mockSetTheme: jest.Mock
  let mockMediaQuery: {
    matches: boolean
    addEventListener: jest.Mock
    removeEventListener: jest.Mock
  }

  beforeEach(() => {
    mockSetTheme = jest.fn()

    // Mock editor store
    const mockStore: MockEditorStore = {
      theme: 'dark',
      setTheme: mockSetTheme,
    }
    mockUseEditorStore.mockReturnValue(mockStore)

    // Mock media query
    mockMediaQuery = {
      matches: true, // dark mode
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }

    mockMatchMedia.mockReturnValue(mockMediaQuery)

    // Mock DOM methods
    const mockClassList = {
      add: jest.fn(),
      remove: jest.fn(),
    }

    const mockStyle = {
      setProperty: jest.fn(),
    }

    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: mockClassList,
        style: mockStyle,
      },
      configurable: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('應該正確初始化', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(result.current.mounted).toBe(true)
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  it('應該偵測系統主題', () => {
    // 測試暗色主題
    mockMediaQuery.matches = true
    const { result } = renderHook(() => useTheme())

    expect(result.current.systemTheme).toBe('dark')

    // 測試亮色主題
    mockMediaQuery.matches = false
    const { result: result2 } = renderHook(() => useTheme())

    expect(result2.current.systemTheme).toBe('light')
  })

  it('應該監聽系統主題變化', () => {
    renderHook(() => useTheme())

    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('應該在卸載時移除監聽器', () => {
    const { unmount } = renderHook(() => useTheme())

    unmount()

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('應該能切換主題', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(mockSetTheme).toHaveBeenCalledWith('light')

    // 模擬主題變更為 light
    const lightThemeStore: MockEditorStore = {
      theme: 'light',
      setTheme: mockSetTheme,
    }
    mockUseEditorStore.mockReturnValue(lightThemeStore)

    const { result: result2 } = renderHook(() => useTheme())

    act(() => {
      result2.current.toggleTheme()
    })

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('應該能直接設定主題', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })

    expect(mockSetTheme).toHaveBeenCalledWith('light')

    act(() => {
      result.current.setTheme('dark')
    })

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('應該正確應用暗色主題樣式', () => {
    const darkThemeStore: MockEditorStore = {
      theme: 'dark',
      setTheme: mockSetTheme,
    }
    mockUseEditorStore.mockReturnValue(darkThemeStore)

    renderHook(() => useTheme())

    const root = document.documentElement
    expect(root.classList.add).toHaveBeenCalledWith('dark')
    expect(root.style.setProperty).toHaveBeenCalledWith(
      '--background',
      '224 71.4% 4.1%'
    )
    expect(root.style.setProperty).toHaveBeenCalledWith(
      '--foreground',
      '210 20% 98%'
    )
  })

  it('應該正確應用亮色主題樣式', () => {
    const lightThemeStore: MockEditorStore = {
      theme: 'light',
      setTheme: mockSetTheme,
    }
    mockUseEditorStore.mockReturnValue(lightThemeStore)

    renderHook(() => useTheme())

    const root = document.documentElement
    expect(root.classList.remove).toHaveBeenCalledWith('dark')
    expect(root.style.setProperty).toHaveBeenCalledWith(
      '--background',
      '0 0% 100%'
    )
    expect(root.style.setProperty).toHaveBeenCalledWith(
      '--foreground',
      '222.2 84% 4.9%'
    )
  })

  it('掛載狀態應該正確初始化', () => {
    const { result } = renderHook(() => useTheme())

    // 檢查掛載狀態
    expect(result.current.mounted).toBe(true)
  })

  it('應該處理系統主題變化事件', () => {
    renderHook(() => useTheme())

    // 獲取註冊的事件處理器
    const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1]

    // 模擬系統主題變化
    mockMediaQuery.matches = false
    act(() => {
      changeHandler()
    })

    // 這裡需要重新渲染來檢查 systemTheme 的變化
    const { result } = renderHook(() => useTheme())
    expect(result.current.systemTheme).toBe('light')
  })
})
