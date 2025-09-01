'use client'

import React, { useRef, useCallback, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Transform {
  x: number
  y: number
  scale: number
}

interface InteractiveSVGProps {
  svgContent: string
  className?: string
  onTransformChange?: (transform: Transform) => void
  onInteraction?: (
    type: 'wheel' | 'drag' | 'dblclick' | 'keyboard',
    details?: string
  ) => void
}

export const InteractiveSVG: React.FC<InteractiveSVGProps> = ({
  svgContent,
  className,
  onTransformChange,
  onInteraction,
}) => {
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Mouse position relative to container center
      const mouseX = e.clientX - rect.left - centerX
      const mouseY = e.clientY - rect.top - centerY

      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(5, transform.scale * delta))
      const scaleDiff = newScale - transform.scale

      // Adjust pan to zoom towards mouse cursor
      const newX = transform.x - (mouseX * scaleDiff) / transform.scale
      const newY = transform.y - (mouseY * scaleDiff) / transform.scale

      const newTransform = { x: newX, y: newY, scale: newScale }
      setTransform(newTransform)
      onTransformChange?.(newTransform)
      onInteraction?.('wheel', `縮放至 ${(newScale * 100).toFixed(1)}%`)
    },
    [transform, onTransformChange, onInteraction]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left mouse button
        setIsDragging(true)
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
        e.preventDefault()
      }
    },
    [transform]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      const newTransform = { ...transform, x: newX, y: newY }

      setTransform(newTransform)
      onTransformChange?.(newTransform)
      onInteraction?.('drag', `平移至 (${newX.toFixed(0)}, ${newY.toFixed(0)})`)
    },
    [isDragging, dragStart, transform, onTransformChange, onInteraction]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDoubleClick = useCallback(() => {
    const newTransform = { x: 0, y: 0, scale: 1 }
    setTransform(newTransform)
    onTransformChange?.(newTransform)
    onInteraction?.('dblclick', '重置視圖至原始狀態')
  }, [onTransformChange, onInteraction])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return

      const step = 20
      let newTransform = { ...transform }

      switch (e.key) {
        case 'ArrowUp':
          newTransform.y += step
          break
        case 'ArrowDown':
          newTransform.y -= step
          break
        case 'ArrowLeft':
          newTransform.x += step
          break
        case 'ArrowRight':
          newTransform.x -= step
          break
        case '=':
        case '+':
          newTransform.scale = Math.min(5, transform.scale * 1.2)
          break
        case '-':
          newTransform.scale = Math.max(0.1, transform.scale * 0.8)
          break
        case '0':
        case 'r':
        case 'R':
          newTransform = { x: 0, y: 0, scale: 1 }
          break
        default:
          return
      }

      e.preventDefault()
      setTransform(newTransform)
      onTransformChange?.(newTransform)

      // 記錄鍵盤互動
      const keyDescriptions: { [key: string]: string } = {
        ArrowUp: '向上平移',
        ArrowDown: '向下平移',
        ArrowLeft: '向左平移',
        ArrowRight: '向右平移',
        '=': '放大',
        '+': '放大',
        '-': '縮小',
        '0': '重置視圖',
        r: '重置視圖',
        R: '重置視圖',
      }
      onInteraction?.('keyboard', keyDescriptions[e.key] || `按鍵: ${e.key}`)
    },
    [transform, onTransformChange, onInteraction]
  )

  // Event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden bg-background cursor-grab',
        isDragging && 'cursor-grabbing',
        className
      )}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
      role='img'
      aria-label='Interactive Mermaid diagram'
    >
      <div
        ref={svgRef}
        className='absolute inset-0 flex items-center justify-center'
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* 縮放指示器 */}
      <div className='absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-mono'>
        {Math.round(transform.scale * 100)}%
      </div>

      {/* 座標指示器 (僅在開發模式顯示) */}
      {process.env.NODE_ENV === 'development' && (
        <div className='absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-xs font-mono'>
          ({Math.round(transform.x)}, {Math.round(transform.y)})
        </div>
      )}

      {/* 快捷鍵提示 */}
      <div className='absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-md text-xs space-y-1 opacity-60 hover:opacity-100 transition-opacity'>
        <div>滾輪：縮放</div>
        <div>拖拽：平移</div>
        <div>雙擊：重置</div>
        <div>方向鍵：微調位置</div>
        <div>+/-：縮放 | 0：重置</div>
      </div>
    </div>
  )
}
