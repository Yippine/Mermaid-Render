# Story 1.3: 基礎 Mermaid 渲染引擎

## 使用者故事

**身份**: 使用者  
**需求**: 能夠即時渲染 Mermaid 圖表的引擎  
**目的**: 我能看到程式碼的視覺化結果

## 驗收標準

### AC1: Mermaid.js 整合 ✅

- [x] 整合最新版 Mermaid.js 函式庫 (v10.6+)
- [x] 初始化 Mermaid 配置
- [x] 設定安全模式和主題配置
- [x] 支援 ES Module 動態導入

**實作檢查點**:

```typescript
// src/lib/mermaid/mermaidRenderer.ts
import mermaid from 'mermaid'

class MermaidRenderer {
  constructor() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    })
  }
}
```

### AC2: 即時渲染功能 ✅

- [x] 程式碼變更觸發渲染 (防抖 300ms)
- [x] 渲染狀態管理 (loading, success, error)
- [x] 渲染結果快取機制
- [x] 漸進式渲染改善體驗

**實作檢查點**:

```typescript
// src/hooks/useMermaidRenderer.ts
const useMermaidRenderer = () => {
  const [renderState, setRenderState] = useState<RenderState>('idle')
  const [svgContent, setSvgContent] = useState<string>('')

  const debouncedRender = useMemo(
    () =>
      debounce(async (code: string) => {
        setRenderState('loading')
        try {
          const result = await renderMermaid(code)
          setSvgContent(result)
          setRenderState('success')
        } catch (error) {
          setRenderState('error')
        }
      }, 300),
    []
  )

  return { renderState, svgContent, render: debouncedRender }
}
```

### AC3: 基礎圖表類型支援 ✅

- [x] Flowchart / Graph 圖表
- [x] Sequence Diagram 序列圖
- [x] Class Diagram 類別圖
- [x] State Diagram 狀態圖
- [x] User Journey 使用者旅程圖
- [x] Git Graph 版本控制圖

**實作檢查點**:

```typescript
// src/lib/mermaid/supportedTypes.ts
export const SUPPORTED_CHART_TYPES = [
  'graph',
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'journey',
  'gitGraph',
] as const

export const detectChartType = (code: string): string => {
  const firstLine = code.trim().split('\n')[0]
  return (
    SUPPORTED_CHART_TYPES.find(type =>
      firstLine.toLowerCase().includes(type)
    ) || 'unknown'
  )
}
```

### AC4: 錯誤處理系統 ✅

- [x] 語法錯誤捕獲和顯示
- [x] 使用者友善錯誤訊息
- [x] 錯誤位置標示 (行號/列號)
- [x] 修復建議提供

**實作檢查點**:

```typescript
// src/components/preview/ErrorDisplay.tsx
interface MermaidError {
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

const ErrorDisplay: React.FC<{ error: MermaidError }> = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">語法錯誤</h3>
          <p className="text-red-700">{error.message}</p>
          {error.line && (
            <p className="text-sm text-red-600 mt-1">
              行 {error.line}{error.column && `:${error.column}`}
            </p>
          )}
          {error.suggestion && (
            <div className="mt-2 p-2 bg-red-100 rounded">
              <p className="text-sm text-red-800">💡 建議: {error.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### AC5: 渲染效能優化 ✅

- [x] 防抖機制避免頻繁渲染
- [x] 渲染結果記憶體快取
- [x] 大型圖表漸進式載入
- [x] Worker 執行緒渲染 (可選)

**實作檢查點**:

```typescript
// src/lib/mermaid/renderCache.ts
class RenderCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 50

  set(key: string, value: string, metadata: RenderMetadata): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      svg: value,
      timestamp: Date.now(),
      metadata,
    })
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key)
    if (entry && Date.now() - entry.timestamp < 300000) {
      // 5 min TTL
      return entry
    }
    return null
  }
}
```

### AC6: 渲染區域互動 ✅

- [x] 滑鼠滾輪縮放功能
- [x] 拖拽移動圖表
- [x] 雙擊重置視圖
- [x] 縮放級別指示器

**實作檢查點**:

```typescript
// src/components/preview/InteractiveSVG.tsx
const InteractiveSVG: React.FC<{ svgContent: string }> = ({ svgContent }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, prev.scale * delta))
    }));
  }, []);

  const handleDoubleClick = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center center',
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* 縮放指示器 */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
};
```

### AC7: 載入狀態指示器 ✅

- [x] 渲染中的載入動畫
- [x] 渲染進度指示 (大型圖表)
- [x] 載入時間顯示
- [x] 取消渲染功能

**實作檢查點**:

```typescript
// src/components/preview/LoadingIndicator.tsx
const LoadingIndicator: React.FC<{
  isLoading: boolean;
  progress?: number;
  elapsed?: number;
}> = ({ isLoading, progress, elapsed }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="text-sm text-muted-foreground">
          正在渲染圖表...
          {elapsed && ` (${(elapsed / 1000).toFixed(1)}s)`}
        </div>
        {progress !== undefined && (
          <div className="w-48 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

## 技術實作細節

### 渲染引擎架構

```
src/lib/mermaid/
├── MermaidRenderer.ts        # 核心渲染類
├── renderCache.ts           # 渲染快取管理
├── errorHandler.ts          # 錯誤處理
├── typeDetection.ts         # 圖表類型檢測
├── themeManager.ts          # 主題管理
└── performance.ts           # 效能監控
```

### 核心渲染邏輯

```typescript
// src/lib/mermaid/MermaidRenderer.ts
export class MermaidRenderer {
  private cache: RenderCache
  private errorHandler: ErrorHandler

  constructor() {
    this.cache = new RenderCache()
    this.errorHandler = new ErrorHandler()
    this.initializeMermaid()
  }

  async render(
    code: string,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    const cacheKey = this.generateCacheKey(code, options)

    // 檢查快取
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return {
        success: true,
        svg: cached.svg,
        metadata: cached.metadata,
        fromCache: true,
      }
    }

    try {
      // 檢測圖表類型
      const chartType = detectChartType(code)

      // 渲染圖表
      const startTime = performance.now()
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code)
      const renderTime = performance.now() - startTime

      // 後處理 SVG
      const processedSvg = this.postProcessSVG(svg, options)

      const result: RenderResult = {
        success: true,
        svg: processedSvg,
        metadata: {
          chartType,
          renderTime,
          nodeCount: this.countNodes(svg),
          edgeCount: this.countEdges(svg),
        },
        fromCache: false,
      }

      // 快取結果
      this.cache.set(cacheKey, processedSvg, result.metadata)

      return result
    } catch (error) {
      return this.errorHandler.handleRenderError(error, code)
    }
  }

  private postProcessSVG(svg: string, options: RenderOptions): string {
    // SVG 後處理：添加互動性、優化樣式等
    return svg
      .replace(/id="mermaid-\d+"/g, `id="mermaid-${options.id || 'preview'}"`)
      .replace(/<style>/g, '<style>/* Mermaid Generated */')
  }
}
```

### 錯誤處理系統

```typescript
// src/lib/mermaid/errorHandler.ts
export class ErrorHandler {
  handleRenderError(error: unknown, code: string): RenderResult {
    const mermaidError = this.parseMermaidError(error, code)

    return {
      success: false,
      error: mermaidError,
      svg: '',
      metadata: {
        chartType: 'error',
        renderTime: 0,
        nodeCount: 0,
        edgeCount: 0,
      },
      fromCache: false,
    }
  }

  private parseMermaidError(error: unknown, code: string): MermaidError {
    if (error instanceof Error) {
      const lineMatch = error.message.match(/line (\d+)/i)
      const line = lineMatch ? parseInt(lineMatch[1]) : undefined

      return {
        message: this.humanizeError(error.message),
        line,
        suggestion: this.getSuggestion(error.message, code),
      }
    }

    return {
      message: '未知的渲染錯誤',
      suggestion: '請檢查 Mermaid 語法是否正確',
    }
  }

  private getSuggestion(errorMessage: string, code: string): string {
    // 基於錯誤訊息和程式碼內容提供修復建議
    if (errorMessage.includes('Parse error')) {
      return '請檢查圖表語法，確認所有節點和連接都正確定義'
    }
    if (errorMessage.includes('Unsupported')) {
      return '此圖表類型可能不受支援，請參考文件查看支援的類型'
    }
    return '請檢查語法並參考 Mermaid 官方文件'
  }
}
```

## Definition of Done (DoD)

- [ ] 所有驗收標準都已滿足
- [ ] 支援所有基礎 Mermaid 圖表類型
- [ ] 渲染效能符合要求 (< 500ms for 100 節點)
- [ ] 錯誤處理完整且使用者友善
- [ ] 互動功能 (縮放、拖拽) 流暢運作
- [ ] 快取機制正常運作
- [ ] 單元測試覆蓋率 > 90%
- [ ] 整合測試覆蓋所有圖表類型
- [ ] 效能測試通過
- [ ] 無障礙性測試通過

## 預估工時

- **核心渲染邏輯**: 4-5 天
- **錯誤處理系統**: 2-3 天
- **互動功能**: 2-3 天
- **效能優化**: 2-3 天
- **測試撰寫**: 3-4 天

## 相依性

- **前置條件**: Story 1.2 雙面板編輯器介面
- **後續 Story**: Story 1.4 智能語法容錯系統
- **並行開發**: 可與 UI 組件開發並行

## 風險與緩解措施

### 風險 1: Mermaid.js 渲染錯誤難以調試

**機率**: 中  
**影響**: 高  
**緩解**: 建立完整的錯誤處理和日誌系統

### 風險 2: 大型圖表渲染效能問題

**機率**: 中  
**影響**: 中  
**緩解**: 實現漸進式渲染和 Worker 執行緒處理

### 風險 3: SVG 輸出不一致

**機率**: 低  
**影響**: 中  
**緩解**: 建立 SVG 後處理標準化流程

## 測試案例

### 測試案例 1: 基本渲染功能

```typescript
// __tests__/lib/MermaidRenderer.test.ts
describe('MermaidRenderer', () => {
  let renderer: MermaidRenderer

  beforeEach(() => {
    renderer = new MermaidRenderer()
  })

  test('should render simple flowchart', async () => {
    const code = 'graph TD\n  A --> B'
    const result = await renderer.render(code)

    expect(result.success).toBe(true)
    expect(result.svg).toContain('<svg')
    expect(result.metadata.chartType).toBe('graph')
  })

  test('should handle syntax errors gracefully', async () => {
    const code = 'invalid mermaid syntax'
    const result = await renderer.render(code)

    expect(result.success).toBe(false)
    expect(result.error?.message).toBeDefined()
    expect(result.error?.suggestion).toBeDefined()
  })
})
```

### 測試案例 2: 快取機制

```typescript
// __tests__/lib/renderCache.test.ts
describe('RenderCache', () => {
  test('should cache render results', async () => {
    const renderer = new MermaidRenderer()
    const code = 'graph TD\n  A --> B'

    // 首次渲染
    const result1 = await renderer.render(code)
    expect(result1.fromCache).toBe(false)

    // 第二次渲染應該來自快取
    const result2 = await renderer.render(code)
    expect(result2.fromCache).toBe(true)
    expect(result2.svg).toBe(result1.svg)
  })
})
```

### 測試案例 3: 互動功能

```typescript
// __tests__/components/InteractiveSVG.test.tsx
describe('InteractiveSVG', () => {
  test('should handle zoom on wheel event', async () => {
    const svgContent = '<svg><g></g></svg>';
    render(<InteractiveSVG svgContent={svgContent} />);

    const container = screen.getByRole('img', { hidden: true });

    // 模擬滾輪縮放
    fireEvent.wheel(container, { deltaY: -100 });

    // 檢查縮放指示器
    expect(screen.getByText(/110%/)).toBeInTheDocument();
  });
});
```

## 驗收測試清單

### 功能驗收

- [ ] 支援的圖表類型都能正確渲染
- [ ] 語法錯誤能被正確捕獲和顯示
- [ ] 渲染結果能正確快取和複用
- [ ] 互動功能 (縮放、拖拽) 正常運作
- [ ] 載入狀態正確顯示

### 效能驗收

- [ ] 簡單圖表 (< 20 節點) 渲染時間 < 100ms
- [ ] 中等圖表 (< 100 節點) 渲染時間 < 500ms
- [ ] 複雜圖表 (< 500 節點) 渲染時間 < 2s
- [ ] 記憶體使用在可接受範圍 (< 50MB)
- [ ] 快取命中率 > 80%

### 品質驗收

- [ ] 所有圖表類型的渲染測試通過
- [ ] 錯誤處理涵蓋各種異常情況
- [ ] 使用者體驗流暢無卡頓
- [ ] 程式碼覆蓋率達到要求

---

**Story 狀態**: ✅ Ready for Development  
**更新時間**: 2025-08-31  
**負責開發者**: 待分配  
**技術風險**: 中 (Mermaid.js 整合複雜度)
