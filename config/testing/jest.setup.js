import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}))

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Cytoscape.js
jest.mock('cytoscape', () => {
  return jest.fn(() => ({
    mount: jest.fn(),
    unmount: jest.fn(),
    destroy: jest.fn(),
    nodes: jest.fn(() => ({
      style: jest.fn(),
      data: jest.fn(),
    })),
    edges: jest.fn(() => ({
      style: jest.fn(),
      data: jest.fn(),
    })),
    layout: jest.fn(() => ({
      run: jest.fn(),
    })),
    on: jest.fn(),
    off: jest.fn(),
    fit: jest.fn(),
    center: jest.fn(),
    zoom: jest.fn(),
    pan: jest.fn(),
  }))
})

// Mock ELK.js
jest.mock('elkjs', () => {
  return jest.fn(() => ({
    layout: jest.fn(() =>
      Promise.resolve({
        children: [],
        edges: [],
      })
    ),
  }))
})

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
