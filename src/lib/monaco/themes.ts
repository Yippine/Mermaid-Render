import type { editor } from 'monaco-editor'

export const mermaidDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Comments
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },

    // Keywords
    { token: 'keyword.diagram', foreground: 'C586C0', fontStyle: 'bold' },
    { token: 'keyword.direction', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'keyword.sequence', foreground: 'DCDCAA' },
    { token: 'keyword.class', foreground: '4EC9B0' },
    { token: 'keyword.state', foreground: '9CDCFE' },
    { token: 'keyword.er', foreground: 'CE9178' },
    { token: 'keyword.common', foreground: 'C586C0' },

    // Operators and arrows
    { token: 'operator.arrow', foreground: 'D4D4D4', fontStyle: 'bold' },
    { token: 'operator.sequence', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'operator.er', foreground: 'DCDCAA', fontStyle: 'bold' },
    { token: 'operator.label', foreground: 'D4D4D4', fontStyle: 'bold' },

    // Strings
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.quote', foreground: 'CE9178' },
    { token: 'string.escape', foreground: 'D7BA7D' },
    { token: 'string.invalid', foreground: 'F44747', fontStyle: 'italic' },

    // Variables and identifiers
    { token: 'variable.node', foreground: '9CDCFE', fontStyle: 'bold' },
    { token: 'identifier', foreground: 'D4D4D4' },

    // Numbers
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'number.float', foreground: 'B5CEA8' },

    // Delimiters
    { token: 'delimiter.square', foreground: 'FFD700' },
    { token: 'delimiter.curly', foreground: 'DA70D6' },
    { token: 'delimiter.parenthesis', foreground: 'DA70D6' },
    { token: 'delimiter', foreground: 'D4D4D4' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#c6c6c6',
    'editor.selectionBackground': '#264f78',
    'editor.selectionHighlightBackground': '#add6ff26',
    'editor.findMatchBackground': '#515c6a',
    'editor.findMatchHighlightBackground': '#ea5c0055',
    'editor.wordHighlightBackground': '#575757b8',
    'editor.wordHighlightStrongBackground': '#004972b8',
    'editorCursor.foreground': '#aeafad',
    'editor.lineHighlightBackground': '#282828',
    'editorIndentGuide.background': '#404040',
    'editorIndentGuide.activeBackground': '#707070',
    'editorBracketMatch.background': '#0064001a',
    'editorBracketMatch.border': '#888888',
  },
}

export const mermaidLightTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // Comments
    { token: 'comment', foreground: '008000', fontStyle: 'italic' },

    // Keywords
    { token: 'keyword.diagram', foreground: 'AF00DB', fontStyle: 'bold' },
    { token: 'keyword.direction', foreground: '0000FF', fontStyle: 'bold' },
    { token: 'keyword.sequence', foreground: '795E26' },
    { token: 'keyword.class', foreground: '267f99' },
    { token: 'keyword.state', foreground: '001080' },
    { token: 'keyword.er', foreground: 'A31515' },
    { token: 'keyword.common', foreground: 'AF00DB' },

    // Operators and arrows
    { token: 'operator.arrow', foreground: '000000', fontStyle: 'bold' },
    { token: 'operator.sequence', foreground: '0000FF', fontStyle: 'bold' },
    { token: 'operator.er', foreground: '795E26', fontStyle: 'bold' },
    { token: 'operator.label', foreground: '000000', fontStyle: 'bold' },

    // Strings
    { token: 'string', foreground: 'A31515' },
    { token: 'string.quote', foreground: 'A31515' },
    { token: 'string.escape', foreground: 'FF0000' },
    { token: 'string.invalid', foreground: 'F44747', fontStyle: 'italic' },

    // Variables and identifiers
    { token: 'variable.node', foreground: '001080', fontStyle: 'bold' },
    { token: 'identifier', foreground: '000000' },

    // Numbers
    { token: 'number', foreground: '09885A' },
    { token: 'number.float', foreground: '09885A' },

    // Delimiters
    { token: 'delimiter.square', foreground: 'B8860B' },
    { token: 'delimiter.curly', foreground: 'DA70D6' },
    { token: 'delimiter.parenthesis', foreground: 'DA70D6' },
    { token: 'delimiter', foreground: '000000' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#000000',
    'editorLineNumber.foreground': '#237893',
    'editorLineNumber.activeForeground': '#0B216F',
    'editor.selectionBackground': '#ADD6FF',
    'editor.selectionHighlightBackground': '#ADD6FF80',
    'editor.findMatchBackground': '#A8AC94',
    'editor.findMatchHighlightBackground': '#EA5C0055',
    'editor.wordHighlightBackground': '#57575740',
    'editor.wordHighlightStrongBackground': '#00497240',
    'editorCursor.foreground': '#000000',
    'editor.lineHighlightBackground': '#F0F0F0',
    'editorIndentGuide.background': '#D3D3D3',
    'editorIndentGuide.activeBackground': '#939393',
    'editorBracketMatch.background': '#0064001a',
    'editorBracketMatch.border': '#B9B9B9',
  },
}
