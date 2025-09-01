export default function HomePage() {
  return (
    <main className='container mx-auto py-16 px-4'>
      <div className='text-center space-y-8'>
        <h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Mermaid Render
        </h1>

        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          AI 驅動的高客製化圖表展示平台
        </p>

        <div className='bg-card rounded-lg border p-8 max-w-md mx-auto'>
          <h2 className='text-2xl font-semibold mb-4'>Hello World! 🎉</h2>
          <p className='text-muted-foreground mb-4'>專案基礎架構建立完成</p>
          <div className='text-sm space-y-2'>
            <div className='flex justify-between'>
              <span>前端框架:</span>
              <span className='font-medium'>Next.js 14</span>
            </div>
            <div className='flex justify-between'>
              <span>型別檢查:</span>
              <span className='font-medium'>TypeScript</span>
            </div>
            <div className='flex justify-between'>
              <span>樣式框架:</span>
              <span className='font-medium'>Tailwind CSS</span>
            </div>
            <div className='flex justify-between'>
              <span>狀態:</span>
              <span className='text-green-600 font-medium'>✓ 運行中</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
