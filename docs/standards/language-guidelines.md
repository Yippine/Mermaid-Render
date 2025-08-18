# 專案語言使用規範

## 📋 語言使用準則

### 🌐 根目錄 README.md
- **語言**：全英文
- **目的**：面向國際開發者社群
- **風格**：簡潔有力，技術導向

### 📚 其他所有 Markdown 文件
- **語言**：台灣地區繁體中文
- **字詞標準**：以台灣用詞和語法為主
- **適用範圍**：
  - docs/ 目錄下所有文件
  - .bmad-core/ 目錄下所有文件
  - 專案內部文件
  - 使用者對話

### 💬 Claude Code 對話規範
- **預設語言**：台灣繁體中文
- **用詞習慣**：台灣在地化表達
- **技術討論**：保持繁體中文，專有名詞可保留英文
- **適用範圍**：Claude Code 和使用者的所有對話

### 💻 程式碼撰寫規範
- **程式碼註解**：全英文
- **變數命名**：全英文
- **函數命名**：全英文
- **日誌訊息**：全英文
- **錯誤訊息**：全英文
- **API 文件**：全英文


## 🎯 具體應用範例

### ✅ 正確範例

**README.md (根目錄)**
```markdown
# AI-Powered Interactive Diagram Platform
Break Mermaid limitations, create cinematic experiences
```

**docs/architecture.md**
```markdown
# Mermaid-Render 技術架構文件
本專案採用 Next.js 14 作為前端框架...
```

**程式碼註解**
```typescript
// Initialize Cytoscape.js renderer with ELK layout
const cy = cytoscape({
  container: containerRef.current,
  layout: { name: 'elk' } // Use ELK layout algorithm
});

// Log successful initialization
console.log('Graph renderer initialized successfully');
```

**Claude Code 對話**
```
使用者：請幫我實作圖表渲染功能
Claude：我來幫您實作圖表渲染功能。首先讓我檢查目前的專案結構...
```

### ❌ 錯誤範例

**程式碼註解（避免中文）**
```typescript
// 初始化 Cytoscape.js 渲染器  ❌
const cy = cytoscape({
  container: containerRef.current
});
```

**根目錄 README.md（避免中文）**
```markdown
# 🚀 Mermaid-Render
AI驅動的高客製化圖表展示平台  ❌
```

**Claude Code 對話（避免英文為主）**
```
User: 請幫我實作圖表功能
Claude: I'll help you implement the graph functionality...  ❌
```

## 📝 台灣繁體中文用詞對照

| 情境 | 台灣用詞 | 避免用詞 |
|------|---------|---------|
| 軟體開發 | 程式 | 程序 |
| 數據處理 | 資料 | 數據 |
| 界面設計 | 介面 | 接口 |
| 網路連線 | 網路 | 網絡 |
| 系統設定 | 設定 | 設置 |
| 檔案管理 | 檔案 | 文件 |
| 使用者體驗 | 使用者 | 用戶 |
| 系統配置 | 配置 | 配置 |
| 功能實現 | 實作 | 實現 |

## 🔧 實施方式

### Claude Code 執行規範
- 在每次對話開始時自動遵循此語言規範
- 根據檔案位置自動判斷語言使用
- 程式碼相關內容一律使用英文
- 所有與使用者的對話使用台灣繁體中文

### 開發團隊規範
- 所有開發者必須遵循此語言規範
- Code Review 時檢查語言使用是否正確
- Git Commit Message 使用英文
- Pull Request 描述可使用繁體中文

### 檔案組織規範
- 語言規範文件放置於 `docs/standards/` 目錄下
- 確保 Claude Code 可透過 CLAUDE.md 索引讀取
- 保持與專案文件的一致性

### 自動化檢查
- ESLint 規則檢查程式碼註解語言
- 文件 linting 檢查語言一致性
- CI/CD 流程整合語言規範檢查

## 📋 檢查清單

開發時請確認：
- [ ] README.md 使用全英文
- [ ] docs/ 下的文件使用台灣繁體中文
- [ ] 程式碼註解、變數、函數使用英文
- [ ] Claude Code 對話使用台灣繁體中文
- [ ] 錯誤訊息和日誌使用英文
- [ ] 用詞符合台灣在地化標準

---

*此規範確保專案的國際化友善性，同時保持內部開發和溝通的本土化便利性*