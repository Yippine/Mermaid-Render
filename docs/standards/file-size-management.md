# 檔案大小與模組化管理規範

## 🎯 規範目標

確保專案程式碼與文件的可維護性，透過適當的檔案大小控制和模組化策略，提升開發效率與程式碼品質。

## 📏 檔案大小標準

### 通用檔案大小限制

```typescript
const FILE_SIZE_LIMITS = {
  // 程式碼檔案
  typescript: {
    maxLines: 400,
    warningLines: 300,
    recommendedLines: 250,
  },

  // React 組件
  component: {
    maxLines: 300,
    warningLines: 200,
    recommendedLines: 150,
  },

  // 文件檔案
  markdown: {
    maxLines: 500,
    warningLines: 400,
    recommendedLines: 300,
  },

  // 配置檔案
  config: {
    maxLines: 200,
    warningLines: 150,
    recommendedLines: 100,
  },
}
```

### 檔案類型細分規範

#### 1. TypeScript/JavaScript 檔案

- **硬性限制**：400 行
- **建議大小**：200-300 行
- **觸發拆分**：超過 300 行時考慮重構
- **強制拆分**：超過 400 行必須拆分

#### 2. React 組件檔案

- **硬性限制**：300 行
- **建議大小**：100-200 行
- **單一組件原則**：一個檔案只包含一個主要組件
- **Hook 分離**：複雜 Hook 邏輯應獨立成檔案

#### 3. Markdown 文件

- **硬性限制**：500 行
- **建議大小**：200-400 行
- **章節原則**：每個主要章節考慮獨立檔案
- **參考文件**：複雜參考資料應分割

#### 4. 配置檔案

- **硬性限制**：200 行
- **模組化配置**：大型配置應拆分為多個檔案
- **環境分離**：不同環境配置應獨立

## 🔍 檔案複雜度評估

### 複雜度指標

```typescript
interface FileComplexity {
  lineCount: number
  functionCount: number
  classCount: number
  importCount: number
  cyclomaticComplexity: number
  nestingDepth: number
}

const calculateComplexityScore = (metrics: FileComplexity): number => {
  const weights = {
    lines: 0.3,
    functions: 0.2,
    classes: 0.15,
    imports: 0.1,
    cyclomatic: 0.15,
    nesting: 0.1,
  }

  return (
    (metrics.lineCount / 400) * weights.lines +
    (metrics.functionCount / 10) * weights.functions +
    (metrics.classCount / 5) * weights.classes +
    (metrics.importCount / 20) * weights.imports +
    (metrics.cyclomaticComplexity / 15) * weights.cyclomatic +
    (metrics.nestingDepth / 5) * weights.nesting
  )
}
```

### 複雜度等級

- **綠色 (0.0-0.3)**：健康狀態，無需拆分
- **黃色 (0.3-0.6)**：注意狀態，考慮重構
- **橙色 (0.6-0.8)**：警告狀態，建議拆分
- **紅色 (0.8-1.0)**：危險狀態，必須拆分

## 🛠️ 拆分策略指南

### 1. TypeScript 檔案拆分策略

#### 按功能域拆分

```typescript
// 原始檔案：userManagement.ts (450 行)
// 拆分後：
├── user/
│   ├── userService.ts        // 用戶服務邏輯
│   ├── userValidator.ts      // 驗證邏輯
│   ├── userTypes.ts          // 類型定義
│   └── userUtils.ts          // 輔助函數
```

#### 按抽象層級拆分

```typescript
// 原始檔案：graphRenderer.ts (380 行)
// 拆分後：
├── graph/
│   ├── GraphRenderer.tsx     // 主要組件 (< 200 行)
│   ├── graphHooks.ts         // 自訂 Hooks
│   ├── graphUtils.ts         // 輔助函數
│   └── graphTypes.ts         // 類型定義
```

### 2. React 組件拆分策略

#### 組件層次拆分

```typescript
// 原始：ComplexDashboard.tsx (350 行)
// 拆分後：
├── Dashboard/
│   ├── Dashboard.tsx         // 主容器
│   ├── DashboardHeader.tsx   // 頭部組件
│   ├── DashboardSidebar.tsx  // 側邊欄
│   ├── DashboardContent.tsx  // 內容區域
│   └── dashboardTypes.ts     // 共用類型
```

#### Hook 邏輯分離

```typescript
// 原始：useComplexLogic.ts (280 行)
// 拆分後：
├── hooks/
│   ├── useDataFetching.ts    // 資料獲取邏輯
│   ├── useStateManagement.ts // 狀態管理
│   ├── useEventHandlers.ts   // 事件處理
│   └── index.ts              // 統一匯出
```

### 3. Markdown 文件拆分策略

#### 按主題拆分

```markdown
# 原始：api-documentation.md (450 行)

# 拆分後：

├── api/
│ ├── index.md # API 總覽
│ ├── authentication.md # 認證相關
│ ├── user-endpoints.md # 用戶 API
│ ├── graph-endpoints.md # 圖表 API
│ └── error-handling.md # 錯誤處理
```

#### 按使用場景拆分

```markdown
# 原始：development-guide.md (520 行)

# 拆分後：

├── development/
│ ├── getting-started.md # 快速開始
│ ├── local-setup.md # 本地環境
│ ├── testing-guide.md # 測試指南
│ ├── deployment.md # 部署流程
│ └── troubleshooting.md # 疑難排解
```

## 📋 拆分決策流程

### 自動化檢查觸發條件

```typescript
interface SplitTrigger {
  lineCountExceeded: boolean
  complexityHigh: boolean
  multipleResponsibilities: boolean
  difficultToTest: boolean
  frequentChanges: boolean
}

const shouldSplit = (file: FileAnalysis): SplitDecision => {
  const triggers = {
    lineCountExceeded: file.lineCount > getMaxLines(file.type),
    complexityHigh: file.complexityScore > 0.6,
    multipleResponsibilities: file.responsibilityCount > 3,
    difficultToTest: file.testCoverage < 0.7 && file.lineCount > 200,
    frequentChanges: file.changeFrequency > 0.8,
  }

  const triggerCount = Object.values(triggers).filter(Boolean).length

  return {
    shouldSplit: triggerCount >= 2,
    priority: triggerCount >= 3 ? 'high' : 'medium',
    suggestedStrategy: determineSplitStrategy(file, triggers),
    triggers: triggers,
  }
}
```

### 人工審查檢查點

1. **業務邏輯複雜度**：檔案包含多個不相關的業務邏輯
2. **測試困難度**：單一檔案難以進行完整測試
3. **團隊協作**：多人經常修改同一檔案造成衝突
4. **可讀性**：新團隊成員難以理解檔案結構
5. **維護成本**：修改一個功能需要理解整個檔案

## 🎯 拆分實施指南

### 拆分前檢查清單

- [ ] 確認檔案確實需要拆分
- [ ] 分析檔案職責與相依性
- [ ] 設計拆分後的目錄結構
- [ ] 確保拆分不會破壞現有功能
- [ ] 準備測試用例驗證拆分結果

### 拆分執行步驟

1. **備份原始檔案**
2. **建立新的目錄結構**
3. **逐步移動程式碼片段**
4. **更新 import/export 語句**
5. **執行測試確保功能正常**
6. **更新相關文件**
7. **提交變更並標記重構**

### 拆分後驗證

```typescript
const verifyPostSplit = async (
  originalFile: string,
  splitFiles: string[]
): Promise<VerificationResult> => {
  return {
    functionalityPreserved: await runFunctionalTests(),
    performanceImpact: await measurePerformanceImpact(),
    testCoverageChanged: await compareCoverage(),
    bundleSizeImpact: await measureBundleSize(),
    dependencyGraph: await analyzeDependencies(splitFiles),
  }
}
```

## 🔧 工具與自動化

### 支援工具

- **`/split-file`** - 自動檔案拆分指令
- **ESLint 規則** - 檔案大小限制檢查
- **Webpack 分析** - 打包大小監控
- **SonarQube** - 程式碼複雜度分析

### 持續監控

```typescript
const monitorFileSize = {
  // Git pre-commit hook
  preCommitCheck: (files: string[]) => {
    return files.filter(file => exceedsLimit(file))
  },

  // CI/CD 管道檢查
  ciCheck: async () => {
    const oversizedFiles = await scanForOversizedFiles()
    if (oversizedFiles.length > 0) {
      throw new Error(`發現超大檔案: ${oversizedFiles.join(', ')}`)
    }
  },

  // 定期報告
  generateReport: async () => {
    return await analyzeProjectFileSize()
  },
}
```

## 📊 效益評估

### 拆分帶來的好處

1. **可維護性提升**：單一檔案責任更清晰
2. **測試覆蓋率改善**：較小檔案更容易測試
3. **團隊協作效率**：減少合併衝突
4. **程式碼重用性**：模組化後更容易重用
5. **載入效能**：支援更好的程式碼分割

### 潛在成本

1. **初期重構時間**：拆分需要投入開發時間
2. **檔案數量增加**：可能增加專案複雜度
3. **import 語句增多**：可能影響可讀性
4. **打包配置調整**：可能需要調整建置設定

## 🎓 最佳實務建議

### 預防勝於治療

1. **從設計開始**：在設計階段就考慮模組化
2. **漸進式重構**：定期檢查並逐步優化
3. **編碼規範**：建立團隊編碼標準
4. **程式碼審查**：在 PR 中檢查檔案大小

### 團隊協作

1. **溝通拆分計畫**：重大拆分前與團隊討論
2. **文件更新**：拆分後及時更新相關文件
3. **知識分享**：分享拆分經驗與最佳實務
4. **工具培訓**：確保團隊了解相關工具使用

---

_此規範確保專案程式碼保持適當的複雜度與可維護性，支援長期開發與團隊協作_
