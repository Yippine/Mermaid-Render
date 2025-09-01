# Story 1.5: 自適應節點系統

## Status

**Draft**

## Story

**身份**: 使用者  
**需求**: 節點能夠自動調整大小以完整顯示文字內容  
**目的**: 長標籤和複雜文字都不會被截斷

## 驗收標準

### AC1: 動態節點大小計算

- [ ] 實現動態節點大小計算演算法
- [ ] 根據文字內容自動調整節點寬度和高度
- [ ] 支援不同字型和字體大小的尺寸計算
- [ ] 提供節點尺寸的即時預覽功能

### AC2: 多行文字自動換行

- [ ] 支援長文字自動換行顯示
- [ ] 智能斷行點選擇（避免在不當位置斷行）
- [ ] 維持文字可讀性和美觀度
- [ ] 支援中英文混合文字的正確換行

### AC3: 字型和節點 padding 智能調整

- [ ] 根據文字長度調整字型大小
- [ ] 智能調整節點內部 padding
- [ ] 維持節點整體比例協調
- [ ] 支援不同圖表類型的樣式適配

### AC4: 多語言和字型支援

- [ ] 支援中文、英文、日文等多語言顯示
- [ ] 自動檢測語言並應用適當的字型
- [ ] 處理不同語言的文字寬度差異
- [ ] 支援自訂字型載入和應用

### AC5: 節點尺寸限制管理

- [ ] 設定節點最小尺寸限制
- [ ] 設定節點最大尺寸限制
- [ ] 提供尺寸限制的使用者自訂選項
- [ ] 實現尺寸限制的智能平衡機制

### AC6: 長文字處理選項

- [ ] 提供文字省略號處理選項
- [ ] 支援文字截斷與完整顯示模式切換
- [ ] 實現智能文字摘要功能
- [ ] 提供文字密度調整選項

### AC7: Tooltip 詳細資訊顯示

- [ ] 文字溢出時顯示 tooltip
- [ ] Tooltip 支援完整文字內容顯示
- [ ] 提供豐富的格式化 tooltip
- [ ] 支援 tooltip 的自訂樣式和位置

## Tasks / Subtasks

- [ ] **任務1: 文字測量引擎** (AC: 1, 3)
  - [ ] 建立文字寬度測量函式
  - [ ] 實現多行文字高度計算
  - [ ] 建立字型度量快取機制
  - [ ] 實現文字邊界計算演算法

- [ ] **任務2: 動態節點渲染器** (AC: 1, 2)
  - [ ] 整合 Cytoscape.js 節點渲染系統
  - [ ] 實現動態節點大小更新
  - [ ] 建立節點重繪優化機制
  - [ ] 實現節點樣式動態調整

- [ ] **任務3: 智能換行系統** (AC: 2, 4)
  - [ ] 建立智能斷行演算法
  - [ ] 實現中英文混合換行處理
  - [ ] 建立語言檢測機制
  - [ ] 實現單詞邊界識別

- [ ] **任務4: 字型管理系統** (AC: 3, 4)
  - [ ] 建立字型載入和管理
  - [ ] 實現多語言字型對應
  - [ ] 建立字型回退機制
  - [ ] 實現字型大小智能調整

- [ ] **任務5: 尺寸限制控制** (AC: 5)
  - [ ] 建立節點尺寸限制配置
  - [ ] 實現尺寸平衡演算法
  - [ ] 建立使用者自訂介面
  - [ ] 實現響應式尺寸調整

- [ ] **任務6: 長文字處理選項** (AC: 6)
  - [ ] 實現文字截斷和省略號
  - [ ] 建立文字摘要生成器
  - [ ] 實現顯示模式切換
  - [ ] 建立文字密度調整控制

- [ ] **任務7: Tooltip 系統** (AC: 7)
  - [ ] 整合 Radix UI Tooltip 組件
  - [ ] 實現溢出檢測機制
  - [ ] 建立 tooltip 內容格式化
  - [ ] 實現 tooltip 位置智能調整

- [ ] **任務8: 效能優化與測試** (AC: 1-7)
  - [ ] 實現節點渲染效能監控
  - [ ] 建立記憶化快取機制
  - [ ] 實現批次更新優化
  - [ ] 建立自動化測試案例

## Dev Notes

### 技術架構資訊

**核心技術棧** [Source: docs/architecture/tech-stack.md]:

- 前端使用 Next.js 14 + TypeScript + React 18
- 圖形渲染使用 Cytoscape.js + ELK.js
- UI 組件使用 Radix UI (Tooltip 等)
- 狀態管理使用 Zustand
- 樣式使用 Tailwind CSS

**圖形渲染技術**:

- Cytoscape.js 用於圖形節點渲染和佈局
- ELK.js 用於自動佈局算法
- Canvas API 用於精確的文字測量
- Web Fonts API 用於字型載入

**效能優化技術**:

- Web Workers 用於複雜計算
- RequestAnimationFrame 用於流暢動畫
- 虛擬化渲染用於大型圖表
- 記憶化快取減少重複計算

### 專案結構指引

根據統一專案結構，相關檔案應放置於：

**前端組件位置**:

```
src/components/graph/
├── nodes/
│   ├── AdaptiveNode.tsx
│   ├── NodeRenderer.tsx
│   └── NodeControls.tsx
├── tooltips/
│   ├── NodeTooltip.tsx
│   └── ContentFormatter.tsx
src/lib/rendering/
├── text-measurement.ts
├── node-sizing.ts
├── font-manager.ts
└── layout-optimizer.ts
src/lib/graph/
├── adaptive-layout.ts
├── node-factory.ts
└── style-calculator.ts
```

**樣式和配置**:

```
src/styles/graph/
├── adaptive-nodes.css
├── typography.css
└── tooltips.css
src/config/
├── node-defaults.ts
├── font-config.ts
└── sizing-limits.ts
```

**工具函式位置**:

```
src/utils/
├── text-utils.ts
├── font-utils.ts
├── measurement-utils.ts
└── language-detector.ts
```

### 關鍵演算法設計

**文字測量演算法**:

```typescript
interface TextMetrics {
  width: number
  height: number
  lines: string[]
  overflow: boolean
}

// 使用 Canvas API 精確測量文字尺寸
function measureText(text: string, font: string, maxWidth?: number): TextMetrics
```

**動態節點大小計算**:

```typescript
interface NodeDimensions {
  width: number
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
}

// 根據內容自動計算最佳節點尺寸
function calculateOptimalSize(
  content: string,
  constraints: SizeConstraints
): NodeDimensions
```

**智能換行演算法**:

```typescript
interface LineBreakOptions {
  maxWidth: number
  language: 'zh' | 'en' | 'ja' | 'auto'
  preserveWords: boolean
}

// 智能文字換行，支援多語言
function intelligentLineBreak(text: string, options: LineBreakOptions): string[]
```

### 資料結構設計

**節點配置架構**:

```sql
-- 節點樣式配置表
CREATE TABLE node_styles (
  id UUID PRIMARY KEY,
  graph_type VARCHAR(50),
  min_width INTEGER DEFAULT 60,
  max_width INTEGER DEFAULT 300,
  min_height INTEGER DEFAULT 30,
  max_height INTEGER DEFAULT 200,
  padding_config JSONB,
  font_config JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 字型配置表
CREATE TABLE font_configurations (
  id UUID PRIMARY KEY,
  language VARCHAR(10),
  font_family VARCHAR(100),
  fallback_fonts TEXT[],
  size_range JSONB, -- {min: 10, max: 24, default: 14}
  line_height FLOAT DEFAULT 1.4
);
```

### 測試要求

**測試標準** [Source: docs/architecture/tech-stack.md]:

- 使用 Jest 進行單元測試
- React Testing Library 進行組件測試
- Playwright 進行端對端測試
- 視覺回歸測試驗證渲染效果

**具體測試需求**:

- 文字測量演算法的精確性測試 (誤差 < 2px)
- 不同語言文字的換行測試
- 節點大小計算的效能測試 (< 16ms)
- 大量節點的記憶體使用量測試
- 多種字型和尺寸的視覺測試

**測試檔案位置**:

```
__tests__/lib/rendering/
├── text-measurement.test.ts
├── node-sizing.test.ts
└── font-manager.test.ts

__tests__/components/graph/nodes/
├── AdaptiveNode.test.tsx
└── NodeRenderer.test.tsx

__tests__/utils/
├── text-utils.test.ts
└── language-detector.test.ts

__tests__/visual/
├── node-rendering.spec.ts
└── multilanguage-display.spec.ts
```

### 效能考量

**渲染效能優化**:

- 使用 `requestAnimationFrame` 進行批次更新
- 實現節點視窗外的虛擬化渲染
- 文字測量結果快取避免重複計算
- 使用 Web Workers 處理複雜的佈局計算

**記憶體管理**:

- 清理不再使用的 Canvas 上下文
- 字型資源的延遲載入和卸載
- 節點樣式的物件池重用
- DOM 節點的適時清理

**用戶體驗優化**:

- 節點大小變化的平滑過渡動畫
- 載入狀態的視覺反饋
- 響應式設計支援不同螢幕尺寸
- 無障礙設計支援螢幕閱讀器

### 安全性和相容性

**字型安全**:

- 字型檔案的來源驗證
- CSP 設定允許字型資源載入
- 字型回退機制防止載入失敗

**瀏覽器相容性**:

- Canvas API 和 Web Fonts API 的 polyfill
- 不同瀏覽器文字渲染差異的處理
- CSS Grid 和 Flexbox 的回退支援

**輸入安全**:

- 使用者文字輸入的 XSS 防護
- 長文字內容的 DoS 攻擊防護
- 字型文件的安全性檢查

## Change Log

| Date       | Version | Description  | Author       |
| ---------- | ------- | ------------ | ------------ |
| 2025-08-31 | 1.0     | 初始故事建立 | Scrum Master |

## Dev Agent Record

_此區塊將由開發 Agent 在實作過程中填寫_

### Agent Model Used

_待填寫_

### Debug Log References

_待填寫_

### Completion Notes List

_待填寫_

### File List

_待填寫_

## QA Results

_此區塊將由 QA Agent 在測試完成後填寫_

---

**Story 狀態**: 📝 Draft  
**建立時間**: 2025-08-31  
**負責開發者**: 待分配
