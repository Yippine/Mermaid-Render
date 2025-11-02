export default function TraditionalChinesePage() {
  return (
    <main className='container mx-auto py-16 px-4'>
      <div className='text-center space-y-8'>
        <h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Mermaid Render - 繁體中文
        </h1>

        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          AI 驅動的高客製化圖表展示平台
        </p>

        <div className='bg-card rounded-lg border p-8 max-w-md mx-auto'>
          <h2 className='text-2xl font-semibold mb-4'>歡迎使用！ 🎉</h2>
          <p className='text-muted-foreground mb-6'>專案基礎架構建立完成</p>

          <a
            href='/zh-TW/editor'
            className='inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
          >
            開始編輯
          </a>
        </div>
      </div>
    </main>
  )
}
