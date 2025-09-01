'use client'

import React, { ReactNode } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import ResizablePanel from './ResizablePanel'
import { Button } from '@/components/ui/Button'
import {
  PanelLeft,
  PanelRight,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react'

interface EditorLayoutProps {
  editorPanel: ReactNode
  previewPanel: ReactNode
  toolbar?: ReactNode
  className?: string
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  editorPanel,
  previewPanel,
  toolbar,
  className = '',
}) => {
  const {
    isEditorCollapsed,
    isPreviewCollapsed,
    toggleEditor,
    togglePreview,
    resetPanels,
  } = useEditorStore()

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      data-testid='editor-layout'
    >
      {/* 工具列 */}
      {toolbar && (
        <div className='flex-shrink-0 border-b bg-background'>
          <div className='flex items-center justify-between px-4 py-2'>
            {toolbar}

            {/* 面板控制按鈕 */}
            <div className='flex items-center space-x-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleEditor}
                className={`p-2 ${isEditorCollapsed ? 'bg-muted' : ''}`}
                title={isEditorCollapsed ? '顯示編輯器' : '隱藏編輯器'}
                data-testid='toggle-editor-btn'
              >
                <PanelLeft className='h-4 w-4' />
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={togglePreview}
                className={`p-2 ${isPreviewCollapsed ? 'bg-muted' : ''}`}
                title={isPreviewCollapsed ? '顯示預覽' : '隱藏預覽'}
                data-testid='toggle-preview-btn'
              >
                <PanelRight className='h-4 w-4' />
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={resetPanels}
                title='重置面板佈局'
                className='p-2'
                data-testid='reset-panels-btn'
              >
                <RotateCcw className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 主要內容區域 */}
      <div className='flex-1 overflow-hidden'>
        {/* 桌面版 - 並排佈局 */}
        <div className='hidden md:block h-full'>
          <ResizablePanel
            leftPanel={
              <div className='h-full flex flex-col'>
                <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                  <h3 className='text-sm font-medium text-foreground'>
                    編輯器
                  </h3>
                </div>
                <div className='flex-1 overflow-hidden'>{editorPanel}</div>
              </div>
            }
            rightPanel={
              <div className='h-full flex flex-col'>
                <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                  <h3 className='text-sm font-medium text-foreground'>預覽</h3>
                </div>
                <div className='flex-1 overflow-hidden'>{previewPanel}</div>
              </div>
            }
            minPanelWidth={200}
            maxPanelWidth={0.8}
          />
        </div>

        {/* 平板版 - 可切換模式 */}
        <div className='hidden sm:block md:hidden h-full'>
          {!isEditorCollapsed && !isPreviewCollapsed ? (
            // 平板雙面板模式
            <ResizablePanel
              leftPanel={
                <div className='h-full flex flex-col'>
                  <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                    <h3 className='text-sm font-medium text-foreground'>
                      編輯器
                    </h3>
                  </div>
                  <div className='flex-1 overflow-hidden'>{editorPanel}</div>
                </div>
              }
              rightPanel={
                <div className='h-full flex flex-col'>
                  <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                    <h3 className='text-sm font-medium text-foreground'>
                      預覽
                    </h3>
                  </div>
                  <div className='flex-1 overflow-hidden'>{previewPanel}</div>
                </div>
              }
              minPanelWidth={300}
              maxPanelWidth={0.7}
            />
          ) : (
            // 平板全寬模式
            <div className='h-full flex flex-col'>
              {!isEditorCollapsed && (
                <>
                  <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                    <h3 className='text-sm font-medium text-foreground'>
                      編輯器
                    </h3>
                  </div>
                  <div className='flex-1 overflow-hidden'>{editorPanel}</div>
                </>
              )}
              {!isPreviewCollapsed && (
                <>
                  <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                    <h3 className='text-sm font-medium text-foreground'>
                      預覽
                    </h3>
                  </div>
                  <div className='flex-1 overflow-hidden'>{previewPanel}</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 手機版 - 垂直堆疊 */}
        <div className='block sm:hidden h-full'>
          <div className='h-full flex flex-col'>
            {!isEditorCollapsed && (
              <div className='flex-1 flex flex-col min-h-0'>
                <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b flex items-center justify-between'>
                  <h3 className='text-sm font-medium text-foreground'>
                    編輯器
                  </h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={toggleEditor}
                    className='p-1'
                  >
                    <Minimize2 className='h-3 w-3' />
                  </Button>
                </div>
                <div className='flex-1 overflow-hidden'>{editorPanel}</div>
              </div>
            )}

            {!isPreviewCollapsed && (
              <div className='flex-1 flex flex-col min-h-0'>
                <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b border-t flex items-center justify-between'>
                  <h3 className='text-sm font-medium text-foreground'>預覽</h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={togglePreview}
                    className='p-1'
                  >
                    <Minimize2 className='h-3 w-3' />
                  </Button>
                </div>
                <div className='flex-1 overflow-hidden'>{previewPanel}</div>
              </div>
            )}

            {/* 手機版展開按鈕 */}
            {isEditorCollapsed && (
              <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={toggleEditor}
                  className='w-full'
                >
                  <Maximize2 className='h-3 w-3 mr-2' />
                  展開編輯器
                </Button>
              </div>
            )}

            {isPreviewCollapsed && (
              <div className='flex-shrink-0 px-3 py-2 bg-muted/30 border-b'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={togglePreview}
                  className='w-full'
                >
                  <Maximize2 className='h-3 w-3 mr-2' />
                  展開預覽
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorLayout
