import { MermaidError, RenderResult } from '@/types/mermaid.types'

export class ErrorHandler {
  handleRenderError(error: unknown, code: string): RenderResult {
    const mermaidError = this.parseMermaidError(error, code)

    return {
      success: false,
      error: mermaidError,
      svg: '',
      metadata: {
        chartType: 'unknown',
        renderTime: 0,
        nodeCount: 0,
        edgeCount: 0,
      },
      fromCache: false,
    }
  }

  private parseMermaidError(error: unknown, code: string): MermaidError {
    if (error instanceof Error) {
      const lineMatch = error.message.match(/line (\d+)/i)
      const line = lineMatch ? parseInt(lineMatch[1]) : undefined

      return {
        message: this.humanizeError(error.message),
        line,
        suggestion: this.getSuggestion(error.message, code),
      }
    }

    return {
      message: '未知的渲染錯誤',
      suggestion: '請檢查 Mermaid 語法是否正確',
    }
  }

  private humanizeError(errorMessage: string): string {
    // 將 Mermaid 錯誤訊息轉換為使用者友善的中文訊息
    if (errorMessage.includes('Parse error')) {
      return '語法解析錯誤：圖表語法不正確'
    }
    if (errorMessage.includes('Unsupported diagram type')) {
      return '不支援的圖表類型'
    }
    if (errorMessage.includes('undefined')) {
      return '缺少必要的節點或連接定義'
    }
    if (errorMessage.includes('syntax')) {
      return '語法錯誤：請檢查程式碼格式'
    }

    return errorMessage
  }

  private getSuggestion(errorMessage: string, code: string): string {
    // 基於錯誤訊息和程式碼內容提供修復建議
    if (errorMessage.includes('Parse error')) {
      return '請檢查圖表語法，確認所有節點和連接都正確定義'
    }
    if (errorMessage.includes('Unsupported')) {
      return '此圖表類型可能不受支援，請參考文件查看支援的類型'
    }
    if (errorMessage.includes('undefined')) {
      return '請確認所有引用的節點都已正確宣告'
    }
    if (errorMessage.includes('syntax')) {
      const lines = code.split('\n').length
      return `請檢查語法，特別是第 1-${Math.min(lines, 10)} 行的格式`
    }

    return '請檢查語法並參考 Mermaid 官方文件'
  }
}
