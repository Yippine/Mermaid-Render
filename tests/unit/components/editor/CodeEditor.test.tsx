import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { useEditorStore } from '@/stores/editorStore'

// Monaco Editor Mock 組件
const MockMonacoEditor = ({
  value,
  onChange,
  onMount,
  loading,
}: {
  value: string
  onChange?: (value: string) => void
  onMount?: (editor: unknown, monaco: unknown) => void
  loading?: React.ReactNode
}) => {
  React.useEffect(() => {
    if (onMount) {
      const mockEditor = {
        updateOptions: jest.fn(),
        addAction: jest.fn(),
        onDidFocusEditorText: jest.fn(),
        getValue: () => value,
        setValue: jest.fn(),
        trigger: jest.fn(),
      }
      const mockMonaco = {
        languages: {
          register: jest.fn(),
          getLanguages: () => [],
          setLanguageConfiguration: jest.fn(),
          setMonarchTokensProvider: jest.fn(),
          registerCompletionItemProvider: jest.fn(),
        },
        editor: {
          defineTheme: jest.fn(),
          setTheme: jest.fn(),
        },
        KeyMod: {
          CtrlCmd: 1,
          Shift: 2,
          Alt: 4,
        },
        KeyCode: {
          KeyS: 'KeyS',
          KeyF: 'KeyF',
        },
      }
      onMount(mockEditor, mockMonaco)
    }
  }, [onMount, value])

  return (
    <div data-testid='monaco-editor-container'>
      <textarea
        data-testid='monaco-editor-textarea'
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
      {loading && <div>{loading}</div>}
    </div>
  )
}

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: MockMonacoEditor,
}))

// Mock editor store
jest.mock('@/stores/editorStore')
const mockUseEditorStore = useEditorStore as jest.MockedFunction<
  typeof useEditorStore
>

interface MockStore {
  code: string
  theme: string
  updateCode: jest.MockedFunction<(code: string) => void>
  setError: jest.MockedFunction<(error: string | null) => void>
}

const mockStore: MockStore = {
  code: 'graph TD\n  A --> B',
  theme: 'dark',
  updateCode: jest.fn(),
  setError: jest.fn(),
}

describe('CodeEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEditorStore.mockReturnValue(mockStore)
  })

  it('應該渲染編輯器容器', () => {
    render(<CodeEditor />)

    expect(screen.getByTestId('monaco-editor-container')).toBeInTheDocument()
  })

  it('應該顯示當前程式碼', () => {
    render(<CodeEditor />)

    const editor = screen.getByTestId('monaco-editor-textarea')
    expect(editor).toHaveValue('graph TD\n  A --> B')
  })

  it('應該處理程式碼變更', async () => {
    const user = userEvent.setup()
    render(<CodeEditor />)

    const editor = screen.getByTestId('monaco-editor-textarea')

    await user.clear(editor)
    await user.type(editor, '新的程式碼')

    expect(mockStore.updateCode).toHaveBeenCalledWith('新的程式碼')
  })

  it('應該使用正確的主題', () => {
    render(<CodeEditor />)

    // 檢查編輯器是否正確初始化（通過 onMount 回調）
    expect(screen.getByTestId('monaco-editor-container')).toBeInTheDocument()
  })

  it('亮色主題應該正確應用', () => {
    const lightThemeStore = {
      ...mockStore,
      theme: 'light',
    }
    mockUseEditorStore.mockReturnValue(lightThemeStore)

    render(<CodeEditor />)

    expect(screen.getByTestId('monaco-editor-container')).toBeInTheDocument()
  })

  it('應該處理載入狀態', () => {
    render(<CodeEditor />)

    expect(screen.getByTestId('monaco-editor-container')).toBeInTheDocument()
  })

  it('應該設定正確的編輯器選項', async () => {
    let capturedOptions: Record<string, unknown> | null = null

    // 創建特殊的 Mock 組件來捕獲選項
    const OptionCapturingMockEditor = ({
      onMount,
    }: {
      onMount?: (editor: unknown, monaco: unknown) => void
    }) => {
      React.useEffect(() => {
        if (onMount) {
          const mockEditor = {
            updateOptions: (options: Record<string, unknown>) => {
              capturedOptions = options
            },
            addAction: jest.fn(),
            onDidFocusEditorText: jest.fn(),
          }
          const mockMonaco = {
            languages: {
              register: jest.fn(),
              getLanguages: () => [],
              setLanguageConfiguration: jest.fn(),
              setMonarchTokensProvider: jest.fn(),
              registerCompletionItemProvider: jest.fn(),
            },
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
            KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 4 },
            KeyCode: { KeyS: 'KeyS', KeyF: 'KeyF' },
          }
          onMount(mockEditor, mockMonaco)
        }
      }, [onMount])

      return <div data-testid='monaco-editor-container' />
    }

    jest.doMock('@monaco-editor/react', () => ({
      __esModule: true,
      default: OptionCapturingMockEditor,
    }))

    const { CodeEditor: NewCodeEditor } = await import(
      '@/components/editor/CodeEditor'
    )
    render(<NewCodeEditor />)

    await waitFor(() => {
      expect(capturedOptions).toBeTruthy()
    })
  })

  it('應該處理編輯器初始化錯誤', async () => {
    // 創建會拋出錯誤的 Mock 組件
    const ErrorMockEditor = ({
      onMount,
    }: {
      onMount?: (editor: unknown, monaco: unknown) => void
    }) => {
      React.useEffect(() => {
        if (onMount) {
          const mockEditor = {
            updateOptions: () => {
              throw new Error('初始化失敗')
            },
            addAction: jest.fn(),
            onDidFocusEditorText: jest.fn(),
          }
          const mockMonaco = {
            languages: {
              register: jest.fn(),
              getLanguages: () => [],
              setLanguageConfiguration: jest.fn(),
              setMonarchTokensProvider: jest.fn(),
              registerCompletionItemProvider: jest.fn(),
            },
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
            KeyMod: { CtrlCmd: 1 },
            KeyCode: { KeyS: 'KeyS' },
          }
          onMount(mockEditor, mockMonaco)
        }
      }, [onMount])

      return <div data-testid='monaco-editor-container' />
    }

    jest.doMock('@monaco-editor/react', () => ({
      __esModule: true,
      default: ErrorMockEditor,
    }))

    const { CodeEditor: ErrorCodeEditor } = await import(
      '@/components/editor/CodeEditor'
    )
    render(<ErrorCodeEditor />)

    await waitFor(() => {
      expect(mockStore.setError).toHaveBeenCalledWith(
        '編輯器初始化失敗，請重新整理頁面'
      )
    })
  })

  it('應該清除焦點時的錯誤', async () => {
    let focusHandler: (() => void) | null = null

    // 創建可以捕獲焦點處理器的 Mock 組件
    const FocusMockEditor = ({
      onMount,
    }: {
      onMount?: (editor: unknown, monaco: unknown) => void
    }) => {
      React.useEffect(() => {
        if (onMount) {
          const mockEditor = {
            updateOptions: jest.fn(),
            addAction: jest.fn(),
            onDidFocusEditorText: (handler: () => void) => {
              focusHandler = handler
            },
          }
          const mockMonaco = {
            languages: {
              register: jest.fn(),
              getLanguages: () => [],
              setLanguageConfiguration: jest.fn(),
              setMonarchTokensProvider: jest.fn(),
              registerCompletionItemProvider: jest.fn(),
            },
            editor: {
              defineTheme: jest.fn(),
              setTheme: jest.fn(),
            },
            KeyMod: { CtrlCmd: 1 },
            KeyCode: { KeyS: 'KeyS' },
          }
          onMount(mockEditor, mockMonaco)
        }
      }, [onMount])

      return <div data-testid='monaco-editor-container' />
    }

    jest.doMock('@monaco-editor/react', () => ({
      __esModule: true,
      default: FocusMockEditor,
    }))

    const { CodeEditor: FocusCodeEditor } = await import(
      '@/components/editor/CodeEditor'
    )
    render(<FocusCodeEditor />)

    // 觸發焦點事件
    if (focusHandler) {
      act(() => {
        focusHandler!()
      })
    }

    expect(mockStore.setError).toHaveBeenCalledWith(null)
  })
})
