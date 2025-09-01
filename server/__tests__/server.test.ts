import Fastify, { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

describe('Fastify Server', () => {
  let server: ReturnType<typeof Fastify>

  beforeEach(async () => {
    server = Fastify({
      logger: false, // Disable logging during tests
    })

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

    // Register routes
    server.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: expect.any(String),
        service: 'mermaid-render-api',
        version: '0.1.0',
      }
    })

    server.get('/api/hello', async () => {
      return {
        message: 'Hello World from Mermaid Render API! 🚀',
        status: 'success',
        server: 'Fastify',
        database: 'Connected',
        timestamp: expect.any(String),
      }
    })

    server.get('/api/graphs', async () => {
      return {
        graphs: [],
        message: 'Graph API endpoint ready',
        timestamp: expect.any(String),
      }
    })

    // Error handler
    server.setErrorHandler(
      (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        const statusCode = error.statusCode || 500
        const errorResponse = {
          error: true,
          message: error.message || 'Internal Server Error',
          code: error.code || 'INTERNAL_ERROR',
          timestamp: expect.any(String),
        }
        reply.status(statusCode).send(errorResponse)
      }
    )

    // 404 handler
    server.setNotFoundHandler(
      (request: FastifyRequest, reply: FastifyReply) => {
        reply.status(404).send({
          error: true,
          message: 'Route not found',
          path: request.url,
          method: request.method,
          timestamp: expect.any(String),
        })
      }
    )
  })

  afterEach(async () => {
    await server.close()
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload).toMatchObject({
        status: 'ok',
        service: 'mermaid-render-api',
        version: '0.1.0',
      })
      expect(payload.timestamp).toBeDefined()
    })
  })

  describe('API Endpoints', () => {
    it('should return hello world message from /api/hello', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/hello',
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload).toMatchObject({
        message: 'Hello World from Mermaid Render API! 🚀',
        status: 'success',
        server: 'Fastify',
        database: 'Connected',
      })
      expect(payload.timestamp).toBeDefined()
    })

    it('should return empty graphs list from /api/graphs', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/graphs',
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload).toMatchObject({
        graphs: [],
        message: 'Graph API endpoint ready',
      })
      expect(payload.timestamp).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/non-existent',
      })

      expect(response.statusCode).toBe(404)
      const payload = JSON.parse(response.payload)
      expect(payload).toMatchObject({
        error: true,
        message: 'Route not found',
        path: '/non-existent',
        method: 'GET',
      })
      expect(payload.timestamp).toBeDefined()
    })

    it('should handle invalid JSON in POST requests', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/hello',
        payload: 'invalid-json',
        headers: {
          'content-type': 'application/json',
        },
      })

      expect(response.statusCode).toBe(400) // Bad request due to invalid JSON
    })
  })

  describe('CORS Configuration', () => {
    it('should set CORS headers correctly', async () => {
      const response = await server.inject({
        method: 'OPTIONS',
        url: '/api/hello',
        headers: {
          origin: 'http://localhost:3000',
          'access-control-request-method': 'GET',
        },
      })

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000'
      )
      expect(response.headers['access-control-allow-credentials']).toBe('true')
    })
  })

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      })

      // Helmet should add security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting headers', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/hello',
      })

      expect(response.statusCode).toBe(200)
      // Rate limiting headers should be present
      expect(response.headers['x-ratelimit-limit']).toBeDefined()
      expect(response.headers['x-ratelimit-remaining']).toBeDefined()
    })

    // Note: Testing actual rate limiting would require multiple requests
    // and is more suitable for integration tests
  })
})
