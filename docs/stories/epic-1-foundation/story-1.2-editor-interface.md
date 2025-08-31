# Story 1.2: 雙面板編輯器介面

## 使用者故事

**身份**: 使用者  
**需求**: 一個專業的程式碼編輯器與即時預覽面板  
**目的**: 我能夠舒適地編寫和預覽 Mermaid 圖表  

## 驗收標準

### AC1: Monaco Editor 整合 ✅
- [x] 整合 Monaco Editor 作為程式碼編輯器
- [x] 支援 TypeScript/JavaScript 語法高亮
- [x] 設定 Mermaid 語法高亮 (custom language)
- [x] 配置程式碼自動補全功能

**實作檢查點**:
```typescript
// src/components/editor/CodeEditor.tsx
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const CodeEditor: React.FC = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  
  // Mermaid 語言配置
  monaco.languages.register({ id: 'mermaid' });
  monaco.languages.setLanguageConfiguration('mermaid', {
    // 語言配置
  });
};
```

### AC2: 雙面板佈局設計 ✅
- [x] 左右雙面板佈局 (編輯器 + 預覽)
- [x] 響應式設計，支援不同螢幕尺寸
- [x] 面板比例預設 50:50
- [x] 可摺疊面板功能

**實作檢查點**:
```typescript
// src/components/layout/EditorLayout.tsx
const EditorLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <div className="flex-1 min-w-0"> {/* 編輯器面板 */}
        <CodeEditor />
      </div>
      <div className="flex-1 min-w-0"> {/* 預覽面板 */}
        <PreviewPanel />
      </div>
    </div>
  );
};
```

### AC3: 可調整分隔線 ✅
- [x] 分隔線可拖拽調整面板比例
- [x] 最小寬度限制 (200px)
- [x] 雙點擊重置為預設比例
- [x] 拖拽時的視覺反饋

**實作檢查點**:
```typescript
// src/components/layout/ResizablePanel.tsx
const ResizablePanel: React.FC = () => {
  const [leftWidth, setLeftWidth] = useState(50);
  
  const handleMouseDown = (e: MouseEvent) => {
    // 拖拽邏輯
  };
  
  return (
    <div className="flex h-full">
      <div style={{ width: `${leftWidth}%` }}>
        {/* 左面板 */}
      </div>
      <div 
        className="w-1 bg-border cursor-col-resize hover:bg-primary"
        onMouseDown={handleMouseDown}
      />
      <div style={{ width: `${100 - leftWidth}%` }}>
        {/* 右面板 */}
      </div>
    </div>
  );
};
```

### AC4: 編輯器功能特性 ✅
- [x] 基本快速鍵支援 (Ctrl+S, Ctrl+Z, Ctrl+Y)
- [x] 行號顯示
- [x] 程式碼摺疊功能
- [x] 尋找和取代功能
- [x] 多游標編輯

**實作檢查點**:
```typescript
// Monaco Editor 配置
const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  theme: 'vs-dark',
  fontSize: 14,
  lineNumbers: 'on',
  folding: true,
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: 'never',
    seedSearchStringFromSelection: 'never',
  },
  multiCursorModifier: 'ctrlCmd',
};
```

### AC5: 主題切換功能 ✅
- [x] 暗色主題為預設
- [x] 提供亮色主題選項
- [x] 主題切換按鈕
- [x] 系統主題同步 (prefers-color-scheme)

**實作檢查點**:
```typescript
// src/hooks/useTheme.ts
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
  }, []);
  
  return { theme, setTheme };
};
```

### AC6: 預覽面板基礎 ✅
- [x] 即時預覽區域
- [x] 載入狀態指示器
- [x] 錯誤顯示區域
- [x] 空白狀態提示

**實作檢查點**:
```typescript
// src/components/preview/PreviewPanel.tsx
const PreviewPanel: React.FC = () => {
  const { code, isLoading, error } = useEditor();
  
  return (
    <div className="h-full flex flex-col border-l border-border">
      <div className="flex-1 relative">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage error={error} />}
        {!code && <EmptyState />}
        {code && !error && <MermaidRenderer code={code} />}
      </div>
    </div>
  );
};
```

### AC7: 響應式適配 ✅
- [x] 桌面版：雙面板並排顯示
- [x] 平板版：可切換的全寬模式
- [x] 手機版：垂直堆疊佈局
- [x] 觸控友善的操作界面

**實作檢查點**:
```css
/* Responsive Layout */
@media (max-width: 768px) {
  .editor-layout {
    flex-direction: column;
  }
  
  .resize-handle {
    display: none;
  }
}

@media (max-width: 1024px) {
  .editor-panel {
    min-width: 300px;
  }
}
```

## 技術實作細節

### 核心組件架構
```
src/components/
├── editor/
│   ├── CodeEditor.tsx        # Monaco 編輯器組件
│   ├── EditorToolbar.tsx     # 編輯器工具列
│   ├── LanguageSupport.ts    # Mermaid 語言支援
│   └── EditorActions.tsx     # 編輯器操作
├── preview/
│   ├── PreviewPanel.tsx      # 預覽面板
│   ├── LoadingSpinner.tsx    # 載入指示器
│   ├── ErrorMessage.tsx      # 錯誤顯示
│   └── EmptyState.tsx        # 空白狀態
├── layout/
│   ├── EditorLayout.tsx      # 主佈局
│   ├── ResizablePanel.tsx    # 可調整面板
│   └── ThemeProvider.tsx     # 主題提供者
└── ui/
    ├── Button.tsx            # 基礎按鈕
    ├── Separator.tsx         # 分隔線
    └── Tooltip.tsx           # 提示組件
```

### 狀態管理
```typescript
// src/stores/editorStore.ts
interface EditorStore {
  code: string;
  theme: 'light' | 'dark';
  panelRatio: number;
  isPreviewCollapsed: boolean;
  
  // Actions
  updateCode: (code: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setPanelRatio: (ratio: number) => void;
  togglePreview: () => void;
}

const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  theme: 'dark',
  panelRatio: 50,
  isPreviewCollapsed: false,
  
  updateCode: (code) => set({ code }),
  setTheme: (theme) => set({ theme }),
  setPanelRatio: (ratio) => set({ panelRatio: Math.max(20, Math.min(80, ratio)) }),
  togglePreview: () => set((state) => ({ isPreviewCollapsed: !state.isPreviewCollapsed })),
}));
```

### Monaco Editor 自訂配置
```typescript
// src/lib/monaco/mermaidLanguage.ts
export const mermaidLanguageConfig = {
  comments: {
    lineComment: '%%',
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
};

export const mermaidTokensProvider = {
  tokenizer: {
    root: [
      [/graph|flowchart|sequenceDiagram|classDiagram/, 'keyword'],
      [/-->|-.->|==>/, 'operator'],
      [/".*?"/, 'string'],
      [/\w+/, 'identifier'],
    ],
  },
};
```

## Definition of Done (DoD)

- [ ] 所有驗收標準都已滿足
- [ ] Monaco Editor 正確整合並運作
- [ ] 雙面板佈局在各尺寸螢幕正常顯示
- [ ] 拖拽調整面板功能正常
- [ ] 主題切換功能正常
- [ ] 響應式設計測試通過
- [ ] 無障礙性測試通過 (WCAG AA)
- [ ] 單元測試覆蓋率 > 85%
- [ ] 效能測試通過 (載入時間 < 2 秒)
- [ ] 跨瀏覽器相容性測試通過

## 預估工時
- **開發時間**: 5-7 天
- **測試時間**: 2-3 天
- **UI/UX 調整**: 1-2 天

## 相依性
- **前置條件**: Story 1.1 專案基礎架構建立
- **後續 Story**: Story 1.3 基礎 Mermaid 渲染引擎
- **並行開發**: 可與後端 API 開發並行

## 風險與緩解措施

### 風險 1: Monaco Editor Bundle 大小
**機率**: 中  
**影響**: 中  
**緩解**: 使用動態導入，只載入必要的語言支援

### 風險 2: 移動裝置效能問題
**機率**: 中  
**影響**: 中  
**緩解**: 實現漸進式載入，移動版簡化功能

### 風險 3: 面板調整體驗不佳
**機率**: 低  
**影響**: 中  
**緩解**: 充分的使用者測試和調整

## 測試案例

### 測試案例 1: 基礎編輯功能
```typescript
// __tests__/components/CodeEditor.test.tsx
describe('CodeEditor', () => {
  test('should initialize with empty code', () => {
    render(<CodeEditor />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveValue('');
  });
  
  test('should handle code input', async () => {
    render(<CodeEditor />);
    
    const editor = screen.getByRole('textbox');
    await user.type(editor, 'graph TD\n  A --> B');
    
    expect(editor).toHaveValue('graph TD\n  A --> B');
  });
});
```

### 測試案例 2: 面板調整功能
```typescript
// __tests__/components/ResizablePanel.test.tsx
describe('ResizablePanel', () => {
  test('should adjust panel ratio on drag', async () => {
    render(<ResizablePanel />);
    
    const handle = screen.getByRole('separator');
    
    // 模擬拖拽
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(handle, { clientX: 600 });
    fireEvent.mouseUp(handle);
    
    // 驗證比例變化
    const leftPanel = screen.getByTestId('left-panel');
    expect(leftPanel).toHaveStyle('width: 60%');
  });
});
```

### 測試案例 3: 主題切換
```typescript
// __tests__/components/ThemeProvider.test.tsx
describe('ThemeProvider', () => {
  test('should switch between light and dark themes', async () => {
    render(
      <ThemeProvider>
        <EditorLayout />
      </ThemeProvider>
    );
    
    const themeToggle = screen.getByRole('button', { name: /theme/i });
    
    // 預設暗色主題
    expect(document.documentElement).toHaveClass('dark');
    
    // 切換到亮色主題
    await user.click(themeToggle);
    expect(document.documentElement).toHaveClass('light');
  });
});
```

## 驗收測試清單

### UI/UX 驗收
- [ ] 編輯器載入速度 < 2 秒
- [ ] 面板調整操作流暢 (60fps)
- [ ] 主題切換即時生效
- [ ] 響應式佈局在各裝置正常
- [ ] 鍵盤導航完整支援

### 功能驗收
- [ ] 程式碼輸入即時反映
- [ ] 語法高亮正確顯示
- [ ] 面板比例正確保存
- [ ] 摺疊功能正常運作
- [ ] 錯誤狀態正確顯示

### 效能驗收
- [ ] First Contentful Paint < 1.5 秒
- [ ] Time to Interactive < 3 秒
- [ ] 記憶體使用 < 100MB
- [ ] Bundle 大小 < 2MB (gzipped)

---

**Story 狀態**: ✅ Ready for Development  
**更新時間**: 2025-08-31  
**負責開發者**: 待分配  
**設計資源**: 需要 UI/UX 設計師協作面板佈局