# docs/standards/ 組織策略

## 🎯 核心原則

### 自然成長策略
- **非強制分類**：允許檔案在根目錄自然累積
- **閾值觸發**：達到特定數量時才建議分類
- **漸進式重構**：分階段進行目錄重組
- **自動化支援**：提供工具協助分類與引用更新

## 📊 檔案數量管理

### 健康度指標
```typescript
enum DirectoryHealth {
  HEALTHY = 'healthy',     // ≤ 8 檔案：完全健康
  GROWING = 'growing',     // 9-12 檔案：成長中，可考慮分類
  CROWDED = 'crowded',     // 13-18 檔案：擁擠，建議分類
  CRITICAL = 'critical'    // ≥ 19 檔案：臨界，必須分類
}

const assessDirectoryHealth = (fileCount: number): DirectoryHealth => {
  if (fileCount <= 8) return DirectoryHealth.HEALTHY;
  if (fileCount <= 12) return DirectoryHealth.GROWING;  
  if (fileCount <= 18) return DirectoryHealth.CROWDED;
  return DirectoryHealth.CRITICAL;
};
```

### 閾值決策表
| 檔案數量 | 狀態 | /audit 建議 | 行動建議 |
|---------|------|------------|---------|
| 1-8 | 🟢 健康 | 無建議 | 繼續當前組織 |
| 9-12 | 🟡 成長中 | 可考慮分類 | 觀察檔案類型模式 |
| 13-18 | 🟠 擁擠 | 建議分類 | 開始規劃分類策略 |
| 19+ | 🔴 臨界 | 必須分類 | 立即執行分類重構 |

## 📁 分類策略選項

### 策略 A：功能域分類（推薦）
```
docs/standards/
├── api/              # API 設計與介面規範
│   ├── response-format.md
│   ├── authentication.md
│   └── versioning.md
├── ui/               # 使用者介面規範
│   ├── design-system.md
│   ├── accessibility.md  
│   └── responsive.md
├── development/      # 開發流程規範
│   ├── code-review.md
│   ├── testing.md
│   └── documentation.md
├── security/         # 安全相關規範
│   ├── authentication.md
│   └── data-protection.md
└── deployment/       # 部署與營運規範
    ├── environment.md
    └── monitoring.md
```

### 策略 B：規範類型分類
```
docs/standards/
├── processes/        # 流程與工作流程
├── formats/          # 格式與結構規範
├── guidelines/       # 指導原則與最佳實踐
├── policies/         # 政策與規則
└── templates/        # 範本與模板
```

### 策略 C：混合分類
```
docs/standards/
├── core/             # 核心基礎規範
│   ├── language-guidelines.md
│   └── file-naming.md
├── technical/        # 技術相關規範
│   ├── api/
│   └── security/
├── process/          # 流程相關規範
│   ├── development/
│   └── deployment/
└── quality/          # 品質相關規範
    ├── testing.md
    └── performance.md
```

## 🤖 智能分類建議系統

### 分類決策演算法
```typescript
interface ClassificationSuggestion {
  strategy: 'functional' | 'type-based' | 'hybrid';
  categories: Category[];
  migrationPlan: MigrationStep[];
  impact: Impact;
}

const suggestClassification = (files: StandardFile[]): ClassificationSuggestion => {
  const patterns = analyzeFilePatterns(files);
  const strategy = determineOptimalStrategy(patterns);
  
  return {
    strategy: strategy,
    categories: generateCategories(files, strategy),
    migrationPlan: createMigrationPlan(files, strategy),
    impact: assessImpact(files)
  };
};
```

### 檔案模式分析
```typescript
const analyzeFilePatterns = (files: StandardFile[]): FilePatterns => {
  return {
    topicClusters: identifyTopicClusters(files),
    functionalGroups: identifyFunctionalGroups(files),
    typePatterns: identifyTypePatterns(files),
    relationshipMap: buildRelationshipMap(files)
  };
};
```

## 🔄 漸進式重構流程

### 階段 1：分析與規劃
```typescript
const analyzeCurrentState = async (): Promise<AnalysisResult> => {
  const files = await scanStandardsDirectory();
  const health = assessDirectoryHealth(files.length);
  const patterns = analyzeFilePatterns(files);
  const suggestions = suggestClassification(files);
  
  return {
    currentHealth: health,
    fileCount: files.length,
    patterns: patterns,
    suggestions: suggestions
  };
};
```

### 階段 2：分類建議
```bash
🤖 /audit 分類建議範例：

📊 docs/standards/ 目錄分析：
檔案數量：{fileCount} 個 ({statusIcon} {statusText})
建議狀態：需要分類

📋 檔案模式分析：
• API 相關：{apiFilesCount} 個檔案
• 開發流程：{devFilesCount} 個檔案  
• 安全規範：{securityFilesCount} 個檔案
• 其他：{otherFilesCount} 個檔案

💡 建議分類策略：功能域分類
建議目錄：
├── api/ ({apiFilesCount} 檔案)
├── development/ ({devFilesCount} 檔案)
├── security/ ({securityFilesCount} 檔案)
└── general/ ({otherFilesCount} 檔案)

🔧 執行選項：
1. 立即執行自動分類
2. 查看詳細遷移計畫
3. 自訂分類策略
4. 暫時跳過分類
```

### 階段 3：自動遷移
```typescript
const executeMigration = async (plan: MigrationPlan): Promise<MigrationResult> => {
  const steps = plan.steps;
  const results = [];
  
  for (const step of steps) {
    // 1. 建立目標目錄
    await createDirectory(step.targetDirectory);
    
    // 2. 移動檔案
    await moveFile(step.sourceFile, step.targetPath);
    
    // 3. 更新所有引用
    await updateAllReferences(step.sourceFile, step.targetPath);
    
    results.push({ step, success: true });
  }
  
  // 4. 更新索引檔案
  await updateIndexFile();
  
  // 5. 驗證遷移結果
  await validateMigration();
  
  return { steps: results, success: true };
};
```

## 🔗 引用更新管理

### 自動引用更新
```typescript
const updateReferences = async (oldPath: string, newPath: string): Promise<void> => {
  const affectedFiles = await findFilesWithReferences(oldPath);
  
  for (const file of affectedFiles) {
    await updateFileReferences(file, oldPath, newPath);
  }
  
  // 更新索引檔案
  await updateIndexReferences(oldPath, newPath);
  
  // 更新 CLAUDE.md
  await updateClaudeConfig(oldPath, newPath);
};
```

### 引用追蹤系統
```typescript
interface ReferenceTracker {
  sourceFile: string;
  targetFile: string;
  referenceType: 'direct-link' | 'cross-reference' | 'index-entry';
  lineNumber: number;
  context: string;
}

const trackReferences = async (file: string): Promise<ReferenceTracker[]> => {
  const content = await readFile(file);
  const references = [];
  
  // 掃描 markdown 連結
  const links = extractMarkdownLinks(content);
  references.push(...links.map(link => ({
    sourceFile: file,
    targetFile: link.target,
    referenceType: 'direct-link',
    lineNumber: link.line,
    context: link.context
  })));
  
  return references;
};
```

## 📋 分類執行檢查清單

### 分類前檢查
- [ ] 分析檔案模式和關聯性
- [ ] 識別最佳分類策略
- [ ] 生成遷移計畫
- [ ] 評估引用更新影響範圍

### 分類執行
- [ ] 建立目標目錄結構
- [ ] 按計畫移動檔案
- [ ] 更新所有檔案內的引用連結
- [ ] 更新 `index.md` 索引
- [ ] 更新 `CLAUDE.md` 配置

### 分類後驗證
- [ ] 驗證所有連結可正常運作
- [ ] 確保索引檔案正確
- [ ] 檢查 BMad Method Agent 相容性
- [ ] 執行完整的 `/audit` 檢查

## 🎯 最佳實踐建議

### 時機選擇
- **專案穩定期**：在專案穩定階段進行分類，避免頻繁變動期
- **版本發布前**：在主要版本發布前整理，確保文件結構清晰
- **團隊空閒時**：在開發空檔進行，避免影響主要開發工作

### 溝通策略
- **提前通知**：分類前通知團隊成員
- **文件化變更**：記錄分類變更和新的檔案位置
- **更新指引**：更新相關使用指引和連結

---

*此策略確保 docs/standards/ 目錄能夠隨專案成長而靈活調整，同時維持高效的組織結構*