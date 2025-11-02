'use client'

import React, { useCallback, useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ResizablePanelProps {
  children: React.ReactNode
  height: number
  onHeightChange: (height: number) => void
  minHeight?: number
  maxHeight?: number
  position?: 'top' | 'bottom'
  className?: string
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  height,
  onHeightChange,
  minHeight = 200,
  maxHeight = 800,
  position = 'bottom',
  className,
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startHeight, setStartHeight] = useState(height)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      setStartY(e.clientY)
      setStartHeight(height)
    },
    [height]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      let newHeight: number
      if (position === 'bottom') {
        // For bottom panels, moving mouse up increases height
        newHeight = startHeight + (startY - e.clientY)
      } else {
        // For top panels, moving mouse down increases height
        newHeight = startHeight + (e.clientY - startY)
      }

      // Clamp height within bounds
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))
      onHeightChange(newHeight)
    },
    [
      isResizing,
      startHeight,
      startY,
      position,
      minHeight,
      maxHeight,
      onHeightChange,
    ]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Global mouse event handlers for smooth resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'ns-resize'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={panelRef}
      className={cn('flex flex-col relative', className)}
      style={{ height: `${height}px` }}
    >
      {/* Resize handle */}
      <div
        className={cn(
          'group flex items-center justify-center bg-border hover:bg-border/80 transition-colors cursor-ns-resize relative z-10',
          position === 'bottom' ? 'order-first' : 'order-last',
          isResizing && 'bg-blue-500/20'
        )}
        style={{ height: '4px' }}
        onMouseDown={handleMouseDown}
      >
        {/* Resize indicator */}
        <div
          className={cn(
            'w-12 h-1 bg-muted-foreground/30 rounded-full transition-all group-hover:bg-muted-foreground/50 group-hover:w-16',
            isResizing && 'bg-blue-500 w-16'
          )}
        />
      </div>

      {/* Panel content */}
      <div className='flex-1 min-h-0 overflow-hidden'>{children}</div>
    </div>
  )
}

export default ResizablePanel
