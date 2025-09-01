import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mermaid Render - AI-Driven Graph Visualization',
  description:
    'Transform Mermaid diagrams into interactive, customizable visualizations with AI-powered enhancements.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-TW'>
      <body className={inter.className}>
        <div className='min-h-screen bg-background text-foreground'>
          {children}
        </div>
      </body>
    </html>
  )
}
