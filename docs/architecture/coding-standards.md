# Mermaid-Render 開發標準與最佳實務

## TypeScript 編碼標準

### 1. 命名規範

#### 檔案命名

```typescript
// ✅ 好的命名
components / GraphRenderer.tsx
hooks / useGraphAnimation.ts
types / graph.types.ts
utils / mermaidParser.utils.ts

// ❌ 避免的命名
components / gr.tsx
hooks / graph.ts
types / types.ts
```

#### 變數與函數命名

```typescript
// ✅ 描述性命名
const isNodeHighlighted = true
const calculateOptimalLayout = () => {}
const ANIMATION_DURATION = 300

// ❌ 模糊命名
const flag = true
const calc = () => {}
const DURATION = 300
```

### 2. 型別定義

#### 介面設計原則

```typescript
// ✅ 清楚的介面定義
interface GraphNode {
  id: string
  label: string
  position: Position2D
  style: NodeStyle
  metadata?: NodeMetadata
}

interface GraphEdge {
  id: string
  source: string
  target: string
  style: EdgeStyle
  animationSequence?: number
}

// ❌ 避免使用any
interface BadNode {
  data: any // 避免
}
```

#### 聯合型別與列舉

```typescript
// ✅ 使用聯合型別
type LayoutAlgorithm = 'elk' | 'dagre' | 'force-directed' | 'circular'
type AnimationState = 'idle' | 'playing' | 'paused' | 'completed'

// ✅ 使用const assertions
const LAYOUT_ALGORITHMS = {
  ELK: 'elk',
  DAGRE: 'dagre',
  FORCE_DIRECTED: 'force-directed',
  CIRCULAR: 'circular',
} as const
```

### 3. React 組件標準

#### 組件結構

```typescript
// ✅ 標準組件結構
interface GraphRendererProps {
  graphData: GraphData;
  layoutAlgorithm: LayoutAlgorithm;
  onNodeClick?: (nodeId: string) => void;
}

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  graphData,
  layoutAlgorithm,
  onNodeClick
}) => {
  // Hooks
  const [isAnimating, setIsAnimating] = useState(false);
  const cytoscapeRef = useRef<cytoscape.Core | null>(null);

  // Effects
  useEffect(() => {
    initializeCytoscape();
  }, [graphData]);

  // Handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeClick?.(nodeId);
  }, [onNodeClick]);

  // Render
  return (
    <div className="graph-renderer">
      {/* 渲染內容 */}
    </div>
  );
};
```

#### Hooks 使用規範

```typescript
// ✅ 自訂Hook
export const useGraphAnimation = (graphRef: RefObject<cytoscape.Core>) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const playSequence = useCallback(async (edges: Edge[]) => {
    setIsPlaying(true)
    for (let i = 0; i < edges.length; i++) {
      await animateEdge(edges[i])
      setCurrentStep(i + 1)
    }
    setIsPlaying(false)
  }, [])

  return { currentStep, isPlaying, playSequence }
}
```

## CSS/Tailwind 標準

### 1. 樣式組織

```typescript
// ✅ 使用 clsx 合併樣式
import clsx from 'clsx'

const buttonStyles = clsx(
  'px-4 py-2 rounded-md font-medium transition-colors',
  {
    'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
    'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled,
  }
)
```

### 2. 響應式設計標準

```typescript
// ✅ 行動優先設計
const graphContainerStyles = clsx(
  'w-full h-screen', // 基礎樣式
  'md:h-[80vh]', // 中等螢幕
  'lg:h-[90vh]' // 大螢幕
)
```

## 測試標準

### 1. 單元測試

```typescript
// tests/utils/mermaidParser.test.ts
import { MermaidParser } from '@/utils/mermaidParser'

describe('MermaidParser', () => {
  const parser = new MermaidParser()

  it('應該正確解析基本流程圖', () => {
    const mermaidText = `
      graph TD
      A[開始] --> B[處理]
      B --> C[結束]
    `

    const result = parser.parse(mermaidText)

    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
  })

  it('應該處理複雜的子圖結構', () => {
    // 測試實作
  })
})
```

### 2. 組件測試

```typescript
// tests/components/GraphRenderer.test.tsx
import { render, screen } from '@testing-library/react';
import { GraphRenderer } from '@/components/GraphRenderer';

describe('GraphRenderer', () => {
  const mockGraphData = {
    nodes: [{ id: '1', label: 'Node 1' }],
    edges: []
  };

  it('應該渲染圖表容器', () => {
    render(<GraphRenderer graphData={mockGraphData} />);
    expect(screen.getByTestId('graph-container')).toBeInTheDocument();
  });
});
```

## API 設計標準

### 1. RESTful API 規範

```typescript
// ✅ 清楚的路由結構
GET    /api/graphs           // 取得圖表清單
POST   /api/graphs           // 建立新圖表
GET    /api/graphs/:id       // 取得特定圖表
PUT    /api/graphs/:id       // 更新圖表
DELETE /api/graphs/:id       // 刪除圖表

POST   /api/graphs/:id/share // 建立分享連結
GET    /api/share/:code      // 取得分享圖表
```

### 2. 錯誤處理標準

```typescript
// ✅ 統一錯誤回應格式
interface APIError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// 錯誤處理中間件
export const errorHandler = (
  error: Error,
  req: Request,
  reply: FastifyReply
) => {
  const apiError: APIError = {
    code: error.name || 'INTERNAL_ERROR',
    message: error.message,
    timestamp: new Date().toISOString(),
  }

  reply.status(500).send(apiError)
}
```

## Git 工作流程

### 1. 分支命名規範

```bash
# 功能開發
feature/graph-animation-system
feature/ai-integration

# 錯誤修復
fix/node-overlap-issue
fix/memory-leak-cytoscape

# 熱修復
hotfix/critical-rendering-bug

# 發布準備
release/v1.0.0
```

### 2. 提交訊息規範

```bash
# ✅ 好的提交訊息
feat: 實作關聯線序列播放功能
fix: 修復大規模圖表記憶體洩漏問題
docs: 更新API文件
refactor: 重構Mermaid解析器架構

# ❌ 避免的訊息
update code
fix bug
changes
```

## 性能最佳實務

### 1. React 性能優化

```typescript
// ✅ 使用 React.memo 避免不必要渲染
export const GraphNode = React.memo<GraphNodeProps>(({ node, isHighlighted }) => {
  return (
    <div className={clsx('node', { 'highlighted': isHighlighted })}>
      {node.label}
    </div>
  );
});

// ✅ 使用 useMemo 快取昂貴計算
const layoutConfig = useMemo(() => {
  return calculateOptimalLayout(graphData, algorithm);
}, [graphData, algorithm]);
```

### 2. Cytoscape.js 性能優化

```typescript
// ✅ 批次更新節點樣式
const updateNodeStyles = (nodes: string[], style: any) => {
  cy.batch(() => {
    nodes.forEach(nodeId => {
      cy.getElementById(nodeId).style(style)
    })
  })
}
```

## 安全性標準

### 1. 輸入驗證

```typescript
// ✅ 嚴格的輸入驗證
import { z } from 'zod'

const GraphCreateSchema = z.object({
  title: z.string().min(1).max(255),
  mermaidContent: z.string().min(1),
  isPublic: z.boolean().default(false),
})

export const createGraph = async (req: Request, reply: Reply) => {
  const validation = GraphCreateSchema.safeParse(req.body)
  if (!validation.success) {
    return reply.status(400).send({ error: validation.error })
  }
  // 處理邏輯
}
```

### 2. XSS 防護

```typescript
// ✅ 清理使用者輸入
import DOMPurify from 'dompurify'

const sanitizeMermaidContent = (content: string): string => {
  return DOMPurify.sanitize(content)
}
```

---

_所有團隊成員都必須遵循這些標準，以確保程式碼品質與一致性_
