import { RenderCache } from '@/lib/mermaid/renderCache'
import { RenderMetadata } from '@/types/mermaid.types'

describe('RenderCache', () => {
  let cache: RenderCache
  const mockMetadata: RenderMetadata = {
    chartType: 'graph',
    renderTime: 100,
    nodeCount: 2,
    edgeCount: 1,
  }

  beforeEach(() => {
    cache = new RenderCache()
  })

  describe('basic operations', () => {
    it('should set and get cache entries', () => {
      const key = 'test-key'
      const svg = '<svg>Test</svg>'

      cache.set(key, svg, mockMetadata)
      const entry = cache.get(key)

      expect(entry).not.toBeNull()
      expect(entry!.svg).toBe(svg)
      expect(entry!.metadata).toEqual(mockMetadata)
      expect(entry!.timestamp).toBeGreaterThan(0)
    })

    it('should return null for non-existent keys', () => {
      const entry = cache.get('non-existent-key')
      expect(entry).toBeNull()
    })

    it('should update cache size', () => {
      expect(cache.size()).toBe(0)

      cache.set('key1', '<svg>1</svg>', mockMetadata)
      expect(cache.size()).toBe(1)

      cache.set('key2', '<svg>2</svg>', mockMetadata)
      expect(cache.size()).toBe(2)
    })

    it('should clear all entries', () => {
      cache.set('key1', '<svg>1</svg>', mockMetadata)
      cache.set('key2', '<svg>2</svg>', mockMetadata)
      expect(cache.size()).toBe(2)

      cache.clear()
      expect(cache.size()).toBe(0)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('LRU eviction', () => {
    it('should evict oldest entry when cache is full', () => {
      // Note: This test assumes maxSize is 50, which is set in the implementation
      // Fill cache to near capacity
      for (let i = 0; i < 51; i++) {
        cache.set(`key${i}`, `<svg>${i}</svg>`, mockMetadata)
      }

      // First key should be evicted
      expect(cache.get('key0')).toBeNull()

      // Last key should still exist
      expect(cache.get('key50')).not.toBeNull()

      // Cache size should be at max
      expect(cache.size()).toBeLessThanOrEqual(50)
    })

    it('should promote accessed entries in LRU order', () => {
      cache.set('key1', '<svg>1</svg>', mockMetadata)
      cache.set('key2', '<svg>2</svg>', mockMetadata)

      // Access key1 to promote it
      cache.get('key1')

      // Both should still exist
      expect(cache.get('key1')).not.toBeNull()
      expect(cache.get('key2')).not.toBeNull()
    })
  })

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const key = 'test-key'
      const svg = '<svg>Test</svg>'

      cache.set(key, svg, mockMetadata)

      // Entry should exist immediately
      expect(cache.get(key)).not.toBeNull()

      // Mock expired timestamp (5+ minutes ago)
      const entry = cache.get(key)!
      entry.timestamp = Date.now() - 350000 // 5.8 minutes ago

      // Set it back with old timestamp
      cache.set(key, svg, mockMetadata)
      const cacheInstance = cache as unknown as {
        cache: Map<string, { timestamp: number }>
      }
      cacheInstance.cache.set(key, entry)

      // Entry should be expired and return null
      expect(cache.get(key)).toBeNull()
    })

    it('should remove expired entries when accessed', () => {
      const key = 'test-key'

      cache.set(key, '<svg>Test</svg>', mockMetadata)
      expect(cache.size()).toBe(1)

      // Mock expired entry
      const cacheInstance = cache as unknown as {
        cache: Map<string, { timestamp: number }>
      }
      const entry = cacheInstance.cache.get(key)
      if (entry) {
        entry.timestamp = Date.now() - 350000
      }

      // Access should remove expired entry
      cache.get(key)
      expect(cache.size()).toBe(0)
    })
  })

  describe('cache statistics', () => {
    it('should provide cache statistics', () => {
      const stats = cache.getStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('totalRequests')
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.hitRate).toBe('number')
      expect(typeof stats.totalRequests).toBe('number')
    })

    it('should reflect current cache size in stats', () => {
      cache.set('key1', '<svg>1</svg>', mockMetadata)
      cache.set('key2', '<svg>2</svg>', mockMetadata)

      const stats = cache.getStats()
      expect(stats.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle setting same key multiple times', () => {
      const key = 'test-key'

      cache.set(key, '<svg>1</svg>', mockMetadata)
      cache.set(key, '<svg>2</svg>', mockMetadata)

      expect(cache.size()).toBe(1)
      expect(cache.get(key)!.svg).toBe('<svg>2</svg>')
    })

    it('should handle empty string values', () => {
      const key = 'empty-key'

      cache.set(key, '', mockMetadata)
      const entry = cache.get(key)

      expect(entry).not.toBeNull()
      expect(entry!.svg).toBe('')
    })

    it('should handle special characters in keys', () => {
      const key = 'special-key-with-!@#$%^&*()_+'

      cache.set(key, '<svg>Special</svg>', mockMetadata)
      const entry = cache.get(key)

      expect(entry).not.toBeNull()
      expect(entry!.svg).toBe('<svg>Special</svg>')
    })
  })
})
