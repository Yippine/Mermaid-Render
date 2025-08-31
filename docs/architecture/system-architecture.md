# Mermaid-Render 系統架構設計

本文件詳細說明 Mermaid-Render 平台的完整系統架構，基於 PRD 和 UX Spec 的需求，設計一個可擴展、高效能的技術架構，同時為 Phase 2/3 的心智圖、XMind 整合、AI 功能等預留接口。

## 系統概觀

### 架構願景
建立一個分層、模組化的系統架構，支援從 MVP 到完整功能的平滑演進。核心設計原則：
- **漸進式微服務**：MVP 採用 Monolith 設計，預留微服務拆分路徑
- **插件化渲染引擎**：支援多種圖表類型和佈局演算法
- **事件驅動架構**：支援實時互動和序列展示
- **無狀態設計**：易於水平擴展

### 系統架構圖

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[Next.js Frontend]
        B --> C[Monaco Editor]
        B --> D[Cytoscape.js]
        B --> E[ELK.js]
        B --> F[Framer Motion]
    end

    subgraph "API Gateway Layer"
        G[API Gateway / Load Balancer]
    end

    subgraph "Application Layer"
        H[Fastify Server] --> I[Auth Service]
        H --> J[Render Service]
        H --> K[Export Service]
        H --> L[Sequence Service]
        H --> M[File Service]
    end

    subgraph "Data Layer"
        N[(PostgreSQL)] --> O[User Data]
        N --> P[Project Data]
        N --> Q[Template Data]
        R[(Redis)] --> S[Session Cache]
        R --> T[Render Cache]
        R --> U[Export Queue]
    end

    subgraph "External Services"
        V[OpenAI API] 
        W[Cloudinary CDN]
        X[Vercel Analytics]
    end

    subgraph "Future Services (Phase 2/3)"
        Y[AI Service]
        Z[XMind Parser]
        AA[Mindmap Engine]
        AB[Collaboration Service]
    end

    B --> G
    G --> H
    J --> V
    K --> W
    M --> W
    H --> N
    H --> R
    J -.-> Y
    J -.-> Z
    J -.-> AA
    L -.-> AB
```

## 核心服務架構

### 1. 前端架構層

#### Next.js 應用架構
```typescript
// 應用結構
src/
├── app/                    # App Router 頁面
│   ├── layout.tsx         # 根佈局
│   ├── page.tsx          # 主編輯器頁面
│   ├── sequence/         # 序列展示模式
│   └── api/              # API Routes
├── components/            # 組件庫
│   ├── editor/           # 編輯器組件
│   ├── renderer/         # 渲染器組件
│   ├── sequence/         # 序列展示組件
│   ├── export/           # 匯出組件
│   └── ui/               # 基礎 UI 組件
├── lib/                  # 工具庫
│   ├── rendering/        # 渲染引擎
│   ├── sequence/         # 序列控制
│   ├── export/           # 匯出處理
│   └── utils/            # 通用工具
├── hooks/                # React Hooks
├── stores/               # Zustand 狀態管理
├── types/                # TypeScript 類型定義
└── styles/               # 樣式檔案
```

#### 狀態管理架構
```typescript
// Zustand Store 架構
interface AppState {
  // 編輯器狀態
  editor: {
    code: string;
    language: string;
    theme: 'light' | 'dark';
    isLoading: boolean;
  };
  
  // 渲染器狀態
  renderer: {
    engine: 'cytoscape' | 'elk';
    layout: string;
    zoom: number;
    center: { x: number; y: number };
    isRendering: boolean;
  };
  
  // 序列展示狀態
  sequence: {
    mode: 'area' | 'node' | 'edge';
    isPlaying: boolean;
    currentStep: number;
    totalSteps: number;
    speed: number;
    elements: SequenceElement[];
  };
  
  // 匯出狀態
  export: {
    format: 'png' | 'svg';
    resolution: number;
    isExporting: boolean;
    progress: number;
  };
}
```

### 2. 渲染引擎架構

#### 可插拔渲染引擎設計
```typescript
// 渲染引擎接口
interface RenderEngine {
  name: string;
  version: string;
  supportedLayouts: string[];
  
  // 核心方法
  initialize(container: HTMLElement): Promise<void>;
  render(data: GraphData): Promise<RenderResult>;
  layout(algorithm: string): Promise<void>;
  export(format: ExportFormat): Promise<ExportResult>;
  destroy(): void;
  
  // 事件處理
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  
  // 序列展示支援
  highlightElement(id: string, options?: HighlightOptions): void;
  showSequence(sequence: SequenceStep[]): Promise<void>;
  
  // 未來擴展接口
  plugin(plugin: RenderPlugin): void;
}

// Cytoscape.js 實現
class CytoscapeEngine implements RenderEngine {
  private cy: cytoscape.Core;
  
  async render(data: GraphData): Promise<RenderResult> {
    // Mermaid -> Cytoscape 轉換
    const cytoscapeData = this.convertMermaidToCytoscape(data);
    
    // 渲染處理
    this.cy.elements().remove();
    this.cy.add(cytoscapeData);
    
    // 佈局應用
    await this.applyLayout();
    
    return {
      success: true,
      elementCount: this.cy.elements().length,
      renderTime: Date.now()
    };
  }
  
  // 序列展示實現
  async showSequence(sequence: SequenceStep[]): Promise<void> {
    for (const step of sequence) {
      await this.highlightStep(step);
      await this.delay(step.duration);
    }
  }
}

// ELK.js 實現
class ELKEngine implements RenderEngine {
  private elk: ELK;
  
  // 階層佈局特化實現
  async layout(algorithm: string): Promise<void> {
    const graph = this.buildELKGraph();
    const laid = await this.elk.layout(graph);
    this.applyELKLayout(laid);
  }
}
```

### 3. 後端服務架構

#### Fastify 服務層設計
```typescript
// 服務層架構
src/
├── server.ts             # 主服務入口
├── plugins/              # Fastify 插件
│   ├── auth.ts          # 認證插件
│   ├── cors.ts          # CORS 設定
│   ├── ratelimit.ts     # 限流插件
│   └── swagger.ts       # API 文件
├── routes/              # API 路由
│   ├── auth.ts          # 認證路由
│   ├── render.ts        # 渲染 API
│   ├── export.ts        # 匯出 API
│   ├── sequence.ts      # 序列展示 API
│   └── projects.ts      # 專案管理 API
├── services/            # 業務邏輯服務
│   ├── RenderService.ts # 渲染服務
│   ├── ExportService.ts # 匯出服務
│   ├── SequenceService.ts # 序列服務
│   └── ProjectService.ts # 專案服務
├── lib/                 # 工具庫
│   ├── mermaid-parser.ts # Mermaid 解析器
│   ├── layout-engine.ts  # 佈局引擎
│   ├── export-engine.ts  # 匯出引擎
│   └── sequence-engine.ts # 序列引擎
├── types/              # 類型定義
└── utils/              # 工具函數
```

#### 核心服務實現
```typescript
// 渲染服務
@Service()
export class RenderService {
  constructor(
    private mermaidParser: MermaidParser,
    private layoutEngine: LayoutEngine,
    private cacheService: CacheService
  ) {}
  
  async renderMermaid(code: string, options: RenderOptions): Promise<RenderResult> {
    // 檢查快取
    const cacheKey = this.generateCacheKey(code, options);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;
    
    try {
      // 語法容錯處理
      const correctedCode = await this.mermaidParser.correctSyntax(code);
      
      // 解析 Mermaid
      const graph = await this.mermaidParser.parse(correctedCode);
      
      // 應用佈局
      const layoutedGraph = await this.layoutEngine.layout(graph, options.layout);
      
      // 產生渲染結果
      const result = {
        success: true,
        graph: layoutedGraph,
        correctedCode,
        metadata: {
          nodeCount: graph.nodes.length,
          edgeCount: graph.edges.length,
          renderTime: Date.now()
        }
      };
      
      // 快取結果
      await this.cacheService.set(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestions: await this.mermaidParser.getSuggestions(code)
      };
    }
  }
  
  // 序列展示支援
  async generateSequence(code: string, mode: SequenceMode): Promise<SequenceData> {
    const graph = await this.mermaidParser.parse(code);
    return this.sequenceEngine.generateSequence(graph, mode);
  }
}

// 匯出服務
@Service()
export class ExportService {
  constructor(
    private imageProcessor: ImageProcessor,
    private queueService: QueueService
  ) {}
  
  async exportImage(
    graphData: GraphData, 
    format: ExportFormat,
    options: ExportOptions
  ): Promise<ExportResult> {
    // 大型圖表異步處理
    if (graphData.nodes.length > 500) {
      return this.exportLargeGraph(graphData, format, options);
    }
    
    // 即時匯出
    return this.exportDirectly(graphData, format, options);
  }
  
  private async exportLargeGraph(
    graphData: GraphData,
    format: ExportFormat,
    options: ExportOptions
  ): Promise<ExportResult> {
    // 加入匯出佇列
    const jobId = await this.queueService.add('export', {
      graphData,
      format,
      options
    });
    
    return {
      success: true,
      jobId,
      status: 'queued',
      estimatedTime: this.estimateExportTime(graphData.nodes.length)
    };
  }
}
```

### 4. 序列展示架構

#### 序列展示引擎設計
```typescript
// 序列展示核心
export class SequenceEngine {
  private timeline: Timeline;
  private highlightRenderer: HighlightRenderer;
  private animationController: AnimationController;
  
  constructor() {
    this.timeline = new Timeline();
    this.highlightRenderer = new HighlightRenderer();
    this.animationController = new AnimationController();
  }
  
  // 解析序列數據
  parseSequenceData(mermaidCode: string): SequenceData {
    const parser = new MermaidParser();
    const graph = parser.parse(mermaidCode);
    
    return {
      areas: this.extractAreas(graph),
      nodes: this.extractNodes(graph),
      edges: this.extractEdges(graph),
      metadata: this.extractMetadata(graph)
    };
  }
  
  // 建立序列時間軸
  createTimeline(sequenceData: SequenceData, mode: SequenceMode): Timeline {
    const steps: SequenceStep[] = [];
    
    switch (mode) {
      case 'area':
        steps.push(...this.createAreaSteps(sequenceData.areas));
        break;
      case 'node':
        steps.push(...this.createNodeSteps(sequenceData.nodes));
        break;
      case 'edge':
        steps.push(...this.createEdgeSteps(sequenceData.edges));
        break;
    }
    
    return new Timeline(steps);
  }
  
  // 播放序列
  async playSequence(timeline: Timeline, options: PlayOptions): Promise<void> {
    this.animationController.configure(options);
    
    for (const step of timeline.steps) {
      await this.executeStep(step);
      
      if (this.animationController.isPaused()) {
        await this.waitForResume();
      }
    }
  }
  
  private async executeStep(step: SequenceStep): Promise<void> {
    // 高亮目標元素
    await this.highlightRenderer.highlight(step.target, step.style);
    
    // 播放動畫
    await this.animationController.animate(step.animation);
    
    // 更新 UI 狀態
    this.updateStepIndicator(step.index);
  }
}

// 時間軸管理
export class Timeline {
  private steps: SequenceStep[];
  private currentIndex: number = 0;
  
  constructor(steps: SequenceStep[]) {
    this.steps = steps;
  }
  
  // 導航控制
  next(): SequenceStep | null {
    if (this.currentIndex < this.steps.length - 1) {
      return this.steps[++this.currentIndex];
    }
    return null;
  }
  
  previous(): SequenceStep | null {
    if (this.currentIndex > 0) {
      return this.steps[--this.currentIndex];
    }
    return null;
  }
  
  jumpTo(index: number): SequenceStep | null {
    if (index >= 0 && index < this.steps.length) {
      this.currentIndex = index;
      return this.steps[index];
    }
    return null;
  }
  
  // 狀態查詢
  get progress(): number {
    return this.steps.length > 0 ? (this.currentIndex + 1) / this.steps.length : 0;
  }
  
  get isComplete(): boolean {
    return this.currentIndex >= this.steps.length - 1;
  }
}
```

### 5. 高效能匯出系統

#### 匯出引擎架構
```typescript
// 匯出引擎
export class ExportEngine {
  private canvasRenderer: CanvasRenderer;
  private svgRenderer: SVGRenderer;
  private imageProcessor: ImageProcessor;
  private workerPool: WorkerPool;
  
  constructor() {
    this.canvasRenderer = new CanvasRenderer();
    this.svgRenderer = new SVGRenderer();
    this.imageProcessor = new ImageProcessor();
    this.workerPool = new WorkerPool(4); // 4 worker threads
  }
  
  async exportPNG(
    graphData: GraphData, 
    options: PNGExportOptions
  ): Promise<ExportResult> {
    // 計算實際圖表尺寸
    const bounds = this.calculateGraphBounds(graphData);
    const canvasSize = this.calculateCanvasSize(bounds, options);
    
    // 大型圖表分塊處理
    if (canvasSize.width > 4096 || canvasSize.height > 4096) {
      return this.exportLargePNG(graphData, options, bounds);
    }
    
    // 標準匯出
    return this.exportStandardPNG(graphData, options, bounds);
  }
  
  private async exportLargePNG(
    graphData: GraphData,
    options: PNGExportOptions,
    bounds: GraphBounds
  ): Promise<ExportResult> {
    // 分塊策略
    const chunks = this.calculateChunks(bounds, options);
    const chunkResults: ChunkResult[] = [];
    
    // 並行渲染各區塊
    const chunkPromises = chunks.map(chunk => 
      this.workerPool.execute('renderChunk', {
        graphData: this.filterGraphDataByChunk(graphData, chunk),
        options,
        chunk
      })
    );
    
    const results = await Promise.all(chunkPromises);
    
    // 合併區塊
    const finalImage = await this.imageProcessor.combineChunks(results, bounds);
    
    return {
      success: true,
      data: finalImage,
      metadata: {
        originalSize: bounds,
        chunkCount: chunks.length,
        totalPixels: finalImage.width * finalImage.height
      }
    };
  }
  
  async exportSVG(
    graphData: GraphData, 
    options: SVGExportOptions
  ): Promise<ExportResult> {
    // SVG 向量匯出
    const svgContent = await this.svgRenderer.render(graphData, options);
    
    // 優化 SVG 程式碼
    const optimizedSVG = await this.svgRenderer.optimize(svgContent, {
      removeComments: true,
      minifyStyles: true,
      optimizePaths: true
    });
    
    return {
      success: true,
      data: optimizedSVG,
      metadata: {
        fileSize: optimizedSVG.length,
        elementCount: graphData.nodes.length + graphData.edges.length
      }
    };
  }
}

// Canvas 渲染器
export class CanvasRenderer {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;
  
  async renderToCanvas(
    graphData: GraphData, 
    options: RenderOptions
  ): Promise<ImageData> {
    this.setupCanvas(options);
    
    // 渲染背景
    this.renderBackground(options.backgroundColor);
    
    // 渲染邊線
    for (const edge of graphData.edges) {
      await this.renderEdge(edge, options);
    }
    
    // 渲染節點
    for (const node of graphData.nodes) {
      await this.renderNode(node, options);
    }
    
    // 渲染標籤
    for (const label of graphData.labels) {
      await this.renderLabel(label, options);
    }
    
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  
  private async renderNode(node: GraphNode, options: RenderOptions): Promise<void> {
    // 節點形狀渲染
    switch (node.shape) {
      case 'rectangle':
        this.renderRectangle(node, options);
        break;
      case 'circle':
        this.renderCircle(node, options);
        break;
      case 'diamond':
        this.renderDiamond(node, options);
        break;
    }
    
    // 節點文字渲染
    await this.renderNodeText(node, options);
  }
}
```

## 數據架構設計

### 資料庫 Schema 設計

```sql
-- 用戶資料表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 專案資料表
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mermaid_code TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 專案版本歷史
CREATE TABLE project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    mermaid_code TEXT NOT NULL,
    changes_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 匯出記錄
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    format VARCHAR(10) NOT NULL, -- 'png', 'svg'
    options JSONB DEFAULT '{}',
    file_url TEXT,
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 使用分析資料
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引優化
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_exports_project_id ON exports(project_id);
CREATE INDEX idx_usage_analytics_user_id_created_at ON usage_analytics(user_id, created_at);
```

### 快取策略設計

```typescript
// Redis 快取架構
export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  // 渲染結果快取
  async cacheRenderResult(
    codeHash: string, 
    options: RenderOptions, 
    result: RenderResult,
    ttl: number = 3600
  ): Promise<void> {
    const key = this.generateRenderCacheKey(codeHash, options);
    await this.redis.setex(key, ttl, JSON.stringify(result));
  }
  
  async getRenderResult(
    codeHash: string, 
    options: RenderOptions
  ): Promise<RenderResult | null> {
    const key = this.generateRenderCacheKey(codeHash, options);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  // 匯出佇列管理
  async addExportJob(jobData: ExportJobData): Promise<string> {
    const jobId = generateId();
    const key = `export:job:${jobId}`;
    
    await Promise.all([
      this.redis.hset(key, jobData),
      this.redis.lpush('export:queue', jobId),
      this.redis.expire(key, 86400) // 24 hours
    ]);
    
    return jobId;
  }
  
  async getExportJobStatus(jobId: string): Promise<ExportJobStatus | null> {
    const key = `export:job:${jobId}`;
    const jobData = await this.redis.hgetall(key);
    return jobData ? this.parseJobStatus(jobData) : null;
  }
  
  // 序列展示快取
  async cacheSequenceData(
    projectId: string,
    mode: SequenceMode,
    sequenceData: SequenceData
  ): Promise<void> {
    const key = `sequence:${projectId}:${mode}`;
    await this.redis.setex(key, 1800, JSON.stringify(sequenceData)); // 30 min
  }
  
  // 使用者會話快取
  async cacheUserSession(
    sessionId: string,
    sessionData: SessionData
  ): Promise<void> {
    const key = `session:${sessionId}`;
    await this.redis.setex(key, 7200, JSON.stringify(sessionData)); // 2 hours
  }
}
```

## Phase 2/3 功能預留接口

### 心智圖引擎接口
```typescript
// 心智圖引擎接口（Phase 2）
interface MindmapEngine extends RenderEngine {
  // 心智圖特有方法
  convertFromMermaid(mermaidGraph: GraphData): MindmapData;
  renderMindmap(mindmapData: MindmapData): Promise<RenderResult>;
  
  // 佈局算法
  applyRadialLayout(center: NodeId): Promise<void>;
  applyTreeLayout(direction: 'horizontal' | 'vertical'): Promise<void>;
  
  // 互動功能
  expandNode(nodeId: NodeId): Promise<void>;
  collapseNode(nodeId: NodeId): Promise<void>;
  
  // XMind 整合
  importXMind(xmindData: XMindData): Promise<MindmapData>;
  exportXMind(mindmapData: MindmapData): Promise<XMindData>;
}

// XMind 解析器接口（Phase 2）
interface XMindParser {
  parseXMindFile(file: File): Promise<XMindData>;
  convertToMermaid(xmindData: XMindData): Promise<string>;
  convertFromMermaid(mermaidCode: string): Promise<XMindData>;
  
  // 雙向同步
  syncChanges(xmindData: XMindData, mermaidChanges: MermaidDiff): Promise<XMindData>;
}
```

### AI 服務接口
```typescript
// AI 服務接口（Phase 3）
interface AIService {
  // 自然語言轉圖表
  generateMermaidFromText(
    description: string, 
    context?: GenerationContext
  ): Promise<GenerationResult>;
  
  // 圖表智能編輯
  suggestImprovements(
    mermaidCode: string
  ): Promise<ImprovementSuggestion[]>;
  
  // 自動擴展
  expandGraph(
    mermaidCode: string, 
    expandOptions: ExpandOptions
  ): Promise<ExpansionResult>;
  
  // 智能標籤生成
  generateLabels(
    nodes: GraphNode[], 
    context?: LabelContext
  ): Promise<LabelSuggestion[]>;
}

// 協作服務接口（Phase 3）
interface CollaborationService {
  // 實時協作
  createCollaborationSession(projectId: string): Promise<SessionId>;
  joinSession(sessionId: SessionId, userId: string): Promise<void>;
  
  // 操作同步
  broadcastOperation(sessionId: SessionId, operation: Operation): Promise<void>;
  handleIncomingOperation(operation: Operation): Promise<OperationResult>;
  
  // 衝突解決
  resolveConflict(conflict: Conflict): Promise<Resolution>;
  
  // 歷史追蹤
  trackChange(change: Change): Promise<void>;
  getChangeHistory(projectId: string): Promise<Change[]>;
}
```

### 子圖表系統接口
```typescript
// 子圖表系統接口（Phase 3）
interface SubgraphSystem {
  // 子圖表管理
  createSubgraph(parentNodeId: NodeId, subgraphData: GraphData): Promise<SubgraphId>;
  getSubgraph(subgraphId: SubgraphId): Promise<GraphData>;
  updateSubgraph(subgraphId: SubgraphId, updates: GraphData): Promise<void>;
  deleteSubgraph(subgraphId: SubgraphId): Promise<void>;
  
  // 導航系統
  navigateToSubgraph(subgraphId: SubgraphId): Promise<NavigationResult>;
  navigateUp(): Promise<NavigationResult>;
  getBreadcrumbs(): NavigationPath[];
  
  // 跨圖表關聯
  createCrossGraphLink(
    sourceGraph: SubgraphId, 
    sourceNode: NodeId,
    targetGraph: SubgraphId, 
    targetNode: NodeId
  ): Promise<CrossLink>;
  
  trackCrossLinks(nodeId: NodeId): Promise<CrossLink[]>;
}
```

## 部署與維運架構

### 容器化部署配置
```yaml
# docker-compose.yml
version: '3.8'
services:
  # 前端應用
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:4000
    depends_on:
      - api
  
  # 後端 API
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/mermaidrender
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  # 資料庫
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=mermaidrender
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # 快取
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  # 監控
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  redis_data:
  grafana_data:
```

### CI/CD 流程設計
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      # 前端測試
      - name: Test Frontend
        run: |
          npm ci
          npm run test:frontend
          npm run test:e2e
      
      # 後端測試
      - name: Test Backend
        run: |
          npm run test:backend
          npm run test:integration
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # 建置映像檔
      - name: Build Docker Images
        run: |
          docker build -f Dockerfile.frontend -t mermaidrender/frontend .
          docker build -f Dockerfile.api -t mermaidrender/api .
      
      # 推送到 Registry
      - name: Push to Registry
        run: |
          docker push mermaidrender/frontend
          docker push mermaidrender/api
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      # 部署到 Vercel (前端)
      - name: Deploy Frontend
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
      
      # 部署到 Railway (後端)
      - name: Deploy Backend
        uses: railway/cli-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          command: up
```

## 監控與觀測

### 效能監控指標
```typescript
// 效能監控
export class PerformanceMonitor {
  private metrics: MetricsCollector;
  
  constructor() {
    this.metrics = new MetricsCollector();
  }
  
  // 渲染效能監控
  monitorRenderPerformance(renderResult: RenderResult): void {
    this.metrics.record('render_time', renderResult.renderTime);
    this.metrics.record('node_count', renderResult.nodeCount);
    this.metrics.record('memory_usage', process.memoryUsage().heapUsed);
  }
  
  // 匯出效能監控
  monitorExportPerformance(exportResult: ExportResult): void {
    this.metrics.record('export_time', exportResult.exportTime);
    this.metrics.record('file_size', exportResult.fileSize);
    this.metrics.record('export_success_rate', exportResult.success ? 1 : 0);
  }
  
  // 使用者體驗監控
  monitorUserExperience(sessionData: SessionData): void {
    this.metrics.record('page_load_time', sessionData.pageLoadTime);
    this.metrics.record('interaction_delay', sessionData.interactionDelay);
    this.metrics.record('error_rate', sessionData.errorCount / sessionData.totalActions);
  }
}
```

## 總結

這個系統架構設計提供了：

1. **MVP 快速交付**：Monolith 設計降低初期複雜度
2. **可擴展性**：模組化設計支援微服務拆分
3. **高效能**：多層快取和異步處理
4. **未來準備**：為心智圖、AI、協作功能預留接口

架構核心優勢：
- 漸進式演進路徑明確
- 技術風險可控
- 效能瓶頸可預期並優化
- 維運複雜度適中

下一步建議：
1. 建立 MVP 基礎架構 POC
2. 核心渲染引擎技術驗證
3. 序列展示功能原型開發
4. 匯出系統效能測試

---

*此架構文件將隨專案發展和需求變化持續更新*