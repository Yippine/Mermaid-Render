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
      message: 'Unknown rendering error',
      suggestion: 'Please check if your Mermaid syntax is correct',
    }
  }

  private humanizeError(errorMessage: string): string {
    // Convert Mermaid error messages to user-friendly English messages
    if (errorMessage.includes('Parse error')) {
      return 'Syntax parsing error: Diagram syntax is incorrect'
    }
    if (errorMessage.includes('Unsupported diagram type')) {
      return 'Unsupported diagram type'
    }
    if (errorMessage.includes('undefined')) {
      return 'Missing required node or connection definitions'
    }
    if (errorMessage.includes('syntax')) {
      return 'Syntax error: Please check code format'
    }

    return errorMessage
  }

  private getSuggestion(errorMessage: string, code: string): string {
    // Provide fix suggestions based on error message and code content
    if (errorMessage.includes('Parse error')) {
      return 'Please check diagram syntax and ensure all nodes and connections are correctly defined'
    }
    if (errorMessage.includes('Unsupported')) {
      return 'This diagram type may not be supported, please refer to documentation for supported types'
    }
    if (errorMessage.includes('undefined')) {
      return 'Please ensure all referenced nodes are properly declared'
    }
    if (errorMessage.includes('syntax')) {
      const lines = code.split('\n').length
      return `Please check syntax, especially lines 1-${Math.min(lines, 10)} format`
    }

    return 'Please check syntax and refer to official Mermaid documentation'
  }
}
