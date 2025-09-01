import { CacheEntry, RenderMetadata } from '@/types/mermaid.types'

export class RenderCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 50
  private readonly TTL = 300000 // 5 minutes

  set(key: string, value: string, metadata: RenderMetadata): void {
    // LRU eviction: remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      svg: value,
      timestamp: Date.now(),
      metadata,
    })
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key)
    if (entry && Date.now() - entry.timestamp < this.TTL) {
      // Move to end for LRU
      this.cache.delete(key)
      this.cache.set(key, entry)
      return entry
    }

    // Remove expired entry
    if (entry) {
      this.cache.delete(key)
    }

    return null
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  getStats(): { size: number; hitRate: number; totalRequests: number } {
    // This is a simplified implementation
    // In a real app, you'd track hits/misses
    return {
      size: this.cache.size,
      hitRate: 0.8, // Mock value
      totalRequests: 100, // Mock value
    }
  }
}
