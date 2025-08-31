# 外部服務配置指南

本文件提供 Mermaid-Render 專案所需的所有外部服務設定步驟，包含開發環境和生產環境的配置說明。

## 📋 服務總覽

### 必需服務 (MVP)
- **OpenAI API** - AI 功能和智能語法修復
- **Cloudinary** - 圖片處理和 CDN
- **Vercel** - 前端部署平台
- **Supabase** - PostgreSQL 資料庫託管
- **Upstash** - Redis 快取服務

### 可選服務 (增強功能)
- **Sentry** - 錯誤追蹤和效能監控
- **Vercel Analytics** - 網站分析
- **GitHub** - 代碼託管和 CI/CD
- **PlausibleAnalytics** - 隱私友善分析

## 🤖 OpenAI API 設定

### 1. 建立 OpenAI 帳戶
1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 使用 Google/GitHub 帳戶註冊或建立新帳戶
3. 驗證電子郵件和手機號碼

### 2. 取得 API 金鑰
```bash
# 1. 進入 API Keys 頁面
https://platform.openai.com/api-keys

# 2. 點擊 "Create new secret key"
# 3. 設定名稱: "Mermaid-Render-Dev" (開發) / "Mermaid-Render-Prod" (生產)
# 4. 複製 API 金鑰 (格式: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

### 3. 設定使用配額
```bash
# 1. 進入 Billing 頁面
https://platform.openai.com/account/billing

# 2. 設定使用限制
# 開發環境: $20/月 (足夠測試使用)
# 生產環境: $100/月 (依據實際使用調整)

# 3. 設定警告通知
# 80% 用量警告
# 90% 用量警告
```

### 4. 環境變數設定
```env
# .env.local (前端)
NEXT_PUBLIC_OPENAI_API_KEY=  # 不要設定，安全風險

# server/.env.local (後端)
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_ORGANIZATION=org-your-org-id  # 可選
OPENAI_MODEL=gpt-4-turbo-preview  # 預設模型
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7
```

### 5. 測試連接
```bash
# 測試 API 連接
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 或使用專案內建測試
cd server
npm run test:openai
```

## 🖼️ Cloudinary 設定

### 1. 建立 Cloudinary 帳戶
1. 前往 [Cloudinary](https://cloudinary.com/)
2. 點擊 "Sign Up for Free"
3. 填寫資訊並驗證電子郵件

### 2. 取得 API 憑證
```bash
# 1. 進入 Dashboard
https://cloudinary.com/console

# 2. 在 "Product Environment Credentials" 區域找到:
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
Environment: cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz123456@your-cloud-name
```

### 3. 設定上傳預設
```bash
# 1. 進入 Settings > Upload
https://cloudinary.com/console/settings/upload

# 2. 建立 Upload Preset
Name: mermaid-render-exports
Mode: Unsigned (開發) / Signed (生產)
Folder: mermaid-exports
Resource Type: Image
Format: Auto
Quality: Auto
```

### 4. 環境變數設定
```env
# server/.env.local
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
CLOUDINARY_UPLOAD_PRESET=mermaid-render-exports
CLOUDINARY_FOLDER=mermaid-exports

# 可選配置
CLOUDINARY_SECURE=true
CLOUDINARY_CDN_SUBDOMAIN=true
```

### 5. 測試上傳
```bash
# 測試圖片上傳
cd server
npm run test:cloudinary

# 或手動測試
curl -X POST \
  https://api.cloudinary.com/v1_1/your-cloud-name/image/upload \
  -F "upload_preset=mermaid-render-exports" \
  -F "file=@test-image.png"
```

## ▲ Vercel 部署設定

### 1. 建立 Vercel 帳戶
1. 前往 [Vercel](https://vercel.com/)
2. 使用 GitHub 帳戶登入
3. 完成初始設定

### 2. 建立專案
```bash
# 1. Import Git Repository
# 選擇 GitHub 倉庫: your-org/mermaid-render

# 2. Configure Project
Root Directory: . (根目錄)
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
```

### 3. 環境變數設定
```bash
# 在 Vercel Dashboard > Settings > Environment Variables 添加:

# 生產環境變數
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_ENV=production
OPENAI_API_KEY=sk-your-production-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
DATABASE_URL=your-production-database-url

# 開發環境變數 (Preview)
NEXT_PUBLIC_API_BASE_URL=https://your-staging-api.com/api
NEXT_PUBLIC_APP_ENV=preview
```

### 4. 自訂網域設定 (可選)
```bash
# 1. 進入 Domains 設定
https://vercel.com/your-team/mermaid-render/settings/domains

# 2. 添加自訂網域
# 輸入: app.mermaidrender.com
# 按照指示設定 DNS 記錄
```

## 🗄️ Supabase 資料庫設定

### 1. 建立 Supabase 專案
1. 前往 [Supabase](https://supabase.com/)
2. 點擊 "Start your project"
3. 使用 GitHub 登入

### 2. 建立新專案
```bash
# 1. 點擊 "New Project"
# 2. 選擇組織 (或建立新組織)
# 3. 填寫專案資訊:
Name: mermaid-render-dev (開發) / mermaid-render-prod (生產)
Database Password: 生成強密碼並保存
Region: Singapore (亞洲用戶) / US East (美洲用戶)
```

### 3. 取得連接資訊
```bash
# 在 Settings > Database 找到:
Connection string:
postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

Connection pooling (推薦):
postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:6543/postgres?pgbouncer=true
```

### 4. 環境變數設定
```env
# server/.env.local
DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"

# Supabase API (如果需要)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. 資料庫初始化
```bash
# 執行 Prisma 遷移
cd server
npx prisma db push
npx prisma generate
npx prisma db seed
```

## 🚀 Upstash Redis 設定

### 1. 建立 Upstash 帳戶
1. 前往 [Upstash](https://upstash.com/)
2. 使用 GitHub 或 Google 帳戶註冊
3. 完成驗證

### 2. 建立 Redis 資料庫
```bash
# 1. 點擊 "Create Database"
# 2. 設定:
Name: mermaid-render-cache
Region: Singapore (或最近的區域)
Type: Regional (Free tier)
Eviction: allkeys-lru (推薦)
```

### 3. 取得連接資訊
```bash
# 在資料庫詳情頁面找到:
UPSTASH_REDIS_REST_URL: https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN: your-token
Redis URL: rediss://:your-password@your-host:6380
```

### 4. 環境變數設定
```env
# server/.env.local
REDIS_URL="rediss://:your-password@your-host:6380"

# 或使用 REST API
UPSTASH_REDIS_REST_URL="https://your-db-name.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### 5. 測試連接
```bash
# 測試 Redis 連接
cd server
npm run test:redis

# 或使用 curl 測試 REST API
curl -X GET \
  -H "Authorization: Bearer your-token" \
  https://your-db-name.upstash.io/ping
```

## 🔍 Sentry 錯誤追蹤設定 (可選)

### 1. 建立 Sentry 帳戶
1. 前往 [Sentry](https://sentry.io/)
2. 註冊帳戶或使用 GitHub 登入
3. 建立新組織

### 2. 建立專案
```bash
# 1. 點擊 "Create Project"
# 2. 選擇平台:
Frontend: React / Next.js
Backend: Node.js
# 3. 專案名稱: mermaid-render
```

### 3. 安裝和配置
```bash
# 安裝 Sentry SDK
npm install @sentry/nextjs @sentry/node

# 初始化配置 (自動生成配置檔案)
npx @sentry/wizard -i nextjs
```

### 4. 環境變數設定
```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=mermaid-render
SENTRY_AUTH_TOKEN=your-auth-token

# server/.env.local
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
```

## 📊 分析服務設定 (可選)

### Vercel Analytics
```bash
# 1. 在 Vercel Dashboard 啟用 Analytics
# 2. 安裝包
npm install @vercel/analytics

# 3. 在 _app.tsx 或 layout.tsx 中添加
import { Analytics } from '@vercel/analytics/react'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
```

### Plausible Analytics (隱私友善)
```bash
# 1. 註冊 Plausible 帳戶
# 2. 添加網站域名
# 3. 環境變數設定
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
NEXT_PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io

# 4. 添加腳本到頁面
<script defer data-domain="your-domain.com" src="https://plausible.io/js/plausible.js"></script>
```

## 🔒 安全性最佳實踐

### API 金鑰管理
```bash
# 1. 永遠不要將 API 金鑰提交到版本控制
echo "*.env*" >> .gitignore
echo "!.env.example" >> .gitignore

# 2. 使用環境變數注入
# 開發: .env.local
# 生產: Vercel 環境變數

# 3. 定期輪換 API 金鑰
# 每 90 天更換一次生產環境金鑰
```

### 權限控制
```bash
# OpenAI API
# 設定使用配額限制
# 監控 API 使用情況

# Cloudinary
# 使用 Signed Upload 於生產環境
# 設定資源存取限制

# 資料庫
# 使用最小權限原則
# 定期檢查存取日誌
```

## 🧪 服務測試腳本

建立測試腳本驗證所有服務連接：

```typescript
// scripts/test-services.ts
import { testOpenAI } from './test-openai'
import { testCloudinary } from './test-cloudinary'
import { testDatabase } from './test-database'
import { testRedis } from './test-redis'

async function testAllServices() {
  console.log('🧪 測試外部服務連接...\n')
  
  const results = await Promise.allSettled([
    testOpenAI(),
    testCloudinary(),
    testDatabase(),
    testRedis(),
  ])
  
  results.forEach((result, index) => {
    const services = ['OpenAI', 'Cloudinary', 'Database', 'Redis']
    if (result.status === 'fulfilled') {
      console.log(`✅ ${services[index]}: 連接成功`)
    } else {
      console.log(`❌ ${services[index]}: ${result.reason}`)
    }
  })
}

// 執行測試
if (require.main === module) {
  testAllServices()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
```

## 📞 支援聯繫

### 服務支援
- **OpenAI**: [help.openai.com](https://help.openai.com/)
- **Cloudinary**: [support.cloudinary.com](https://support.cloudinary.com/)
- **Vercel**: [vercel.com/help](https://vercel.com/help)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

### 緊急聯絡
如果生產環境服務出現問題：
1. 檢查服務狀態頁面
2. 查看 Sentry 錯誤報告
3. 聯繫 DevOps 團隊
4. 如必要，啟動服務降級預案

---

**文件版本**: v1.0  
**最後更新**: 2025-08-31  
**維護者**: DevOps 團隊

建議定期 (每季) 檢查和更新此文件，確保所有服務配置資訊保持最新。