import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from '../page'

describe('HomePage', () => {
  it('應該正確渲染主頁面', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { name: /mermaid render/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/ai 驅動的高客製化圖表展示平台/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/hello world!/i)).toBeInTheDocument()
  })

  it('應該顯示專案資訊', () => {
    render(<HomePage />)

    expect(screen.getByText('Next.js 14')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
    expect(screen.getByText('✓ 運行中')).toBeInTheDocument()
  })

  it('應該有正確的樣式類別', () => {
    render(<HomePage />)

    const title = screen.getByRole('heading', { name: /mermaid render/i })
    expect(title).toHaveClass('text-4xl', 'md:text-6xl', 'font-bold')
  })
})
