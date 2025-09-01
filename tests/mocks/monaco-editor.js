// Mock Monaco Editor
const mockEditor = {
  editor: {
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
  },
  languages: {
    register: jest.fn(),
    getLanguages: () => [],
    setLanguageConfiguration: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    registerCompletionItemProvider: jest.fn(),
  },
  KeyMod: {
    CtrlCmd: 1,
    Shift: 2,
    Alt: 4,
  },
  KeyCode: {
    KeyS: 'KeyS',
    KeyF: 'KeyF',
    KeyE: 'KeyE',
  },
}

export { mockEditor as editor }
export default mockEditor
