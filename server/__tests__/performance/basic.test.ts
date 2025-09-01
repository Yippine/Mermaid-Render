import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

describe('Basic Performance Tests', () => {
  let server: ReturnType<typeof Fastify>

  beforeAll(async () => {
    server = Fastify({ logger: false })

    // Register plugins (same as server.ts)
    await server.register(helmet)
    await server.register(cors, {
      origin: 'http://localhost:3000',
      credentials: true,
    })
    await server.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    })

    // Register test routes
    server.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'mermaid-render-api',
        version: '0.1.0',
        database: 'Connected', // Simplified for performance test
      }
    })

    server.get('/api/hello', async () => {
      return {
        message: 'Hello World from Mermaid Render API! 🚀',
        status: 'success',
        server: 'Fastify',
        database: 'Connected',
        timestamp: new Date().toISOString(),
      }
    })

    server.get('/api/graphs', async () => {
      return {
        graphs: [],
        message: 'Graph API endpoint ready',
        timestamp: new Date().toISOString(),
      }
    })
  })

  afterAll(async () => {
    await server.close()
  })

  describe('Response Time Benchmarks', () => {
    it('health check should respond within 100ms', async () => {
      const start = Date.now()
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      })
      const duration = Date.now() - start

      expect(response.statusCode).toBe(200)
      expect(duration).toBeLessThan(100)
      console.log(`Health check response time: ${duration}ms`)
    })

    it('api/hello should respond within 100ms', async () => {
      const start = Date.now()
      const response = await server.inject({
        method: 'GET',
        url: '/api/hello',
      })
      const duration = Date.now() - start

      expect(response.statusCode).toBe(200)
      expect(duration).toBeLessThan(100)
      console.log(`API hello response time: ${duration}ms`)
    })

    it('api/graphs should respond within 100ms', async () => {
      const start = Date.now()
      const response = await server.inject({
        method: 'GET',
        url: '/api/graphs',
      })
      const duration = Date.now() - start

      expect(response.statusCode).toBe(200)
      expect(duration).toBeLessThan(100)
      console.log(`API graphs response time: ${duration}ms`)
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle 10 concurrent health checks efficiently', async () => {
      const start = Date.now()
      const promises = Array(10)
        .fill(null)
        .map(() =>
          server.inject({
            method: 'GET',
            url: '/health',
          })
        )

      const responses = await Promise.all(promises)
      const duration = Date.now() - start

      // All responses should be successful
      responses.forEach(response => {
        expect(response.statusCode).toBe(200)
      })

      // Total time for 10 concurrent requests should be reasonable
      expect(duration).toBeLessThan(200)
      console.log(`10 concurrent health checks completed in: ${duration}ms`)
    })

    it('should handle mixed API requests concurrently', async () => {
      const start = Date.now()
      const promises = [
        server.inject({ method: 'GET', url: '/health' }),
        server.inject({ method: 'GET', url: '/api/hello' }),
        server.inject({ method: 'GET', url: '/api/graphs' }),
        server.inject({ method: 'GET', url: '/health' }),
        server.inject({ method: 'GET', url: '/api/hello' }),
      ]

      const responses = await Promise.all(promises)
      const duration = Date.now() - start

      responses.forEach(response => {
        expect(response.statusCode).toBe(200)
      })

      expect(duration).toBeLessThan(250)
      console.log(`5 mixed API requests completed in: ${duration}ms`)
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory during repeated requests', async () => {
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const initialMemory = process.memoryUsage()

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await server.inject({
          method: 'GET',
          url: '/health',
        })
      }

      const finalMemory = process.memoryUsage()

      // Memory increase should be reasonable (less than 10MB)
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 10MB

      console.log(
        `Memory increase after 100 requests: ${Math.round(memoryIncrease / 1024)}KB`
      )
    })
  })

  describe('Response Size', () => {
    it('should return appropriately sized responses', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/hello',
      })

      const responseSize = Buffer.byteLength(response.payload, 'utf8')

      // Response should be reasonable size (less than 1KB for simple API)
      expect(responseSize).toBeLessThan(1024)
      expect(responseSize).toBeGreaterThan(50) // Should contain meaningful data

      console.log(`API hello response size: ${responseSize} bytes`)
    })
  })
})
