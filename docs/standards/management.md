# 規範管理流程

## 📋 規範建立自動化流程

當使用者要求建立新的專案規範時，請按照以下流程執行：

### 🎯 規範放置邏輯判斷

```bash
if [規範類型 == "Claude Code 可執行指令"] then
    位置 = ".claude/commands/{功能分類}/"
    範例 = "git 指令集、開發流程指令、部署腳本指令"
    
elif [規範類型 == "專案統一規範"] then
    位置 = "docs/standards/"
    範例 = "語言使用、檔案命名、API設計"
    
elif [規範類型 == "技術架構規範"] then
    位置 = "docs/architecture/"
    範例 = "程式碼標準、技術棧、系統設計"
    
else
    詢問使用者具體需求
fi
```

### 🔧 自動化建立步驟

#### 步驟 1：確認規範類型與位置
- 分析使用者需求，確定規範類型
- 根據類型選擇適當的目錄位置
- 檢查是否需要建立新的功能分類目錄

#### 步驟 2：檢查現有規範
- 讀取 `docs/standards/index.md` 規範索引
- 避免重複建立相同功能的規範
- 確認新規範與現有規範的關聯性

#### 步驟 3：建立規範文件
使用統一的規範文件格式：
```markdown
# 規範名稱
## 規範目的
## 適用範圍  
## 具體規則
## 範例說明
## 檢查清單
```

#### 步驟 4：更新索引文件
- 自動更新 `docs/standards/index.md`
- 新增規範項目到對應分類
- 更新規範清單與交叉引用

#### 步驟 5：更新 CLAUDE.md
- 確保 Claude Code 可讀取新規範
- 更新快速導航連結
- 同步 BMad Method Agent 讀取路徑

### 📁 Claude Code 指令目錄結構

```
.claude/commands/
├── development/          # 開發相關指令
│   ├── setup.md         # 專案設置指令
│   ├── testing.md       # 測試執行指令
│   └── build.md         # 建置相關指令
├── git/                 # Git 相關指令
│   ├── workflow.md      # Git 工作流程指令
│   ├── commit.md        # 提交規範指令
│   └── branch.md        # 分支管理指令
├── deployment/          # 部署相關指令
│   ├── staging.md       # 測試環境部署
│   └── production.md    # 生產環境部署
└── maintenance/         # 維護相關指令
    ├── backup.md        # 備份指令
    └── monitor.md       # 監控指令
```

### 📊 常見規範類型對應

| 使用者需求 | 規範類型 | 建議位置 | 檔案路徑 |
|-----------|---------|---------|----------|
| "Git 提交規範" | Claude Code 指令 | `.claude/commands/git/` | `commit.md` |
| "檔案命名統一" | 專案規範 | `docs/standards/` | `file-naming.md` |
| "API 設計標準" | 專案規範 | `docs/standards/` | `api-design.md` |
| "程式碼格式化" | 技術架構 | `docs/architecture/` | `formatting.md` |
| "測試策略" | 專案規範 | `docs/standards/` | `testing.md` |
| "部署流程" | Claude Code 指令 | `.claude/commands/deployment/` | `workflow.md` |

### 🤖 BMad Method Agent 整合

#### 確保所有 Agent 可讀取
在每個規範文件中包含 BMad 整合資訊：
```yaml
# 規範讀取資訊
bmad_integration:
  readable_by: ["analyst", "architect", "developer", "qa"]
  priority: "high" | "medium" | "low"
  dependencies: ["相關規範檔案清單"]
```

#### 自動交叉引用
在每個規範文件末尾自動新增：
```markdown
## 🔗 相關規範
- [語言使用規範](./language-guidelines.md)
- [開發標準](../architecture/coding-standards.md)
- [專案配置](../../CLAUDE.md)
```

### ✅ 建立規範檢查清單

執行規範建立時，確認以下項目：

- [ ] 確認規範類型與適當位置
- [ ] 檢查是否與現有規範重複或衝突
- [ ] 使用統一的文件格式與風格
- [ ] 更新 `docs/standards/index.md` 索引
- [ ] 更新 `CLAUDE.md` 相關引用
- [ ] 確保 BMad Method Agent 相容性
- [ ] 新增交叉引用連結
- [ ] 提供實用的範例與檢查清單

### 🔄 規範維護指令

#### 規範更新
1. 檢查影響範圍 - 哪些檔案引用此規範
2. 更新規範內容
3. 同步更新所有引用
4. 通知相關 Agent 和開發者

#### 規範廢棄
1. 標記為已廢棄
2. 從索引中移除
3. 更新所有引用連結
4. 保留歷史記錄

---

*此管理流程確保規範建立的自動化與一致性，提升專案管理效率*