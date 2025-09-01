import type { languages, IRange } from 'monaco-editor'

export const mermaidLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    lineComment: '%%',
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*%%\\s*#region\\b'),
      end: new RegExp('^\\s*%%\\s*#endregion\\b'),
    },
  },
}

export const mermaidTokensProvider: languages.IMonarchLanguage = {
  keywords: [
    // Graph types
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'stateDiagram-v2',
    'erDiagram',
    'journey',
    'gitgraph',
    'pieChart',
    'quadrantChart',
    'requirementDiagram',
    'timelineDiagram',
    'mindmap',

    // Directions
    'TD',
    'TB',
    'BT',
    'RL',
    'LR',

    // Sequence diagram keywords
    'participant',
    'actor',
    'note',
    'over',
    'activate',
    'deactivate',
    'loop',
    'end',
    'alt',
    'else',
    'opt',
    'par',
    'and',
    'critical',
    'option',
    'break',
    'rect',
    'autonumber',

    // Class diagram keywords
    'class',
    'namespace',
    'direction',
    'click',

    // State diagram keywords
    'state',
    'hide',
    'show',
    'scale',

    // ER diagram keywords
    'entity',
    'relationship',

    // Common keywords
    'subgraph',
    'title',
    'theme',
    'style',
    'linkStyle',
    'classDef',
    'click',
    'callback',
    'call',
  ],

  operators: [
    '-->',
    '-.->', // Flowchart arrows
    '==>',
    '-..->', // Flowchart special arrows
    '->>',
    '->', // Sequence arrows
    '-->>',
    '-->', // Sequence dotted arrows
    '-x',
    '--x', // Sequence cross arrows
    '=',
    '+=', // ER relationships
    '||--o{',
    '||--||',
    '||--o|', // ER cardinalities
    'o{--||',
    'o{--o{',
    'o{--o|',
    '||..o{',
    '||..|{',
    '||..||',
    '-->|',
    '-.->|',
    '==>|', // Arrows with labels
  ],

  tokenizer: {
    root: [
      // Comments
      [/%%.*$/, 'comment'],

      // Keywords
      [
        /\b(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gitgraph|pieChart|quadrantChart|requirementDiagram|timelineDiagram|mindmap)\b/,
        'keyword.diagram',
      ],
      [/\b(?:TD|TB|BT|RL|LR)\b/, 'keyword.direction'],
      [
        /\b(?:participant|actor|note|over|activate|deactivate|loop|end|alt|else|opt|par|and|critical|option|break|rect|autonumber)\b/,
        'keyword.sequence',
      ],
      [/\b(?:class|namespace|direction|click)\b/, 'keyword.class'],
      [/\b(?:state|hide|show|scale)\b/, 'keyword.state'],
      [/\b(?:entity|relationship)\b/, 'keyword.er'],
      [
        /\b(?:subgraph|title|theme|style|linkStyle|classDef|click|callback|call)\b/,
        'keyword.common',
      ],

      // Operators and arrows
      [/-->|-.->|==>|-..->/, 'operator.arrow'],
      [/->>|->|-->>|-->|--x|-x/, 'operator.sequence'],
      [
        /\|\|--o\{|\|\|--\|\||\|\|--o\||o\{--\|\||o\{--o\{|o\{--o\||\|\|\.\.o\{|\|\|\.\.\|\{|\|\|\.\.\|\|/,
        'operator.er',
      ],
      [/-->\||-.->|\|==>|\|/, 'operator.label'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-terminated string
      [/'/, { token: 'string.quote', bracket: '@open', next: '@stringSingle' }],

      // Node references and IDs
      [/[A-Za-z]\w*(?=\[)/, 'variable.node'],
      [/[A-Za-z]\w*/, 'identifier'],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // Brackets and parentheses
      [/[[\]]/, 'delimiter.square'],
      [/[{}]/, 'delimiter.curly'],
      [/[()]/, 'delimiter.parenthesis'],

      // Whitespace
      { include: '@whitespace' },

      // Other characters
      [/[;,.]/, 'delimiter'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    stringSingle: [
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape'],
      [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/%%.*$/, 'comment'],
    ],
  },
}

export const mermaidCompletionProvider = (
  range: IRange
): languages.CompletionItem[] => [
  // Diagram types
  {
    label: 'graph TD',
    kind: 1, // Keyword
    insertText: 'graph TD\n    $1',
    insertTextRules: 4, // InsertAsSnippet
    detail: 'Top-Down Graph',
    documentation: '建立由上至下的流程圖',
    range,
  },
  {
    label: 'flowchart LR',
    kind: 1,
    insertText: 'flowchart LR\n    $1',
    insertTextRules: 4,
    detail: 'Left-Right Flowchart',
    documentation: '建立由左至右的流程圖',
    range,
  },
  {
    label: 'sequenceDiagram',
    kind: 1,
    insertText:
      'sequenceDiagram\n    participant A\n    participant B\n    A->>B: $1',
    insertTextRules: 4,
    detail: 'Sequence Diagram',
    documentation: '建立時序圖',
    range,
  },
  {
    label: 'classDiagram',
    kind: 1,
    insertText: 'classDiagram\n    class $1 {\n        +method()\n    }',
    insertTextRules: 4,
    detail: 'Class Diagram',
    documentation: '建立類別圖',
    range,
  },

  // Common patterns
  {
    label: 'subgraph',
    kind: 1,
    insertText: 'subgraph $1\n    $2\nend',
    insertTextRules: 4,
    detail: 'Subgraph',
    documentation: '建立子圖',
    range,
  },

  // Node shapes
  {
    label: '[]',
    kind: 17, // Snippet
    insertText: '$1[$2]',
    insertTextRules: 4,
    detail: 'Rectangle node',
    documentation: '建立矩形節點',
    range,
  },
  {
    label: '()',
    kind: 17,
    insertText: '$1($2)',
    insertTextRules: 4,
    detail: 'Round node',
    documentation: '建立圓形節點',
    range,
  },
  {
    label: '{}',
    kind: 17,
    insertText: '$1{$2}',
    insertTextRules: 4,
    detail: 'Diamond node',
    documentation: '建立菱形節點',
    range,
  },
]
