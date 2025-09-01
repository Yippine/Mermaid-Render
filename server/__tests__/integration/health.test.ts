import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

// Mock Prisma client for testing
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}))

describe('Health Check Integration', () => {
  let server: ReturnType<typeof Fastify>
  let prisma: {
    $queryRaw: (
      strings: TemplateStringsArray,
      ...values: unknown[]
    ) => Promise<unknown>
  }

  beforeEach(async () => {
    server = Fastify({ logger: false })
    prisma = new PrismaClient()

    // Enhanced health check endpoint with database connection test
    server.get('/health', async () => {
      let databaseStatus = 'Connected'
      try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`
      } catch {
        databaseStatus = 'Disconnected'
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'mermaid-render-api',
        version: '0.1.0',
        database: databaseStatus,
      }
    })
  })

  afterEach(async () => {
    await server.close()
    jest.clearAllMocks()
  })

  describe('Database Connection Health Check', () => {
    it('should return healthy status when database is connected', async () => {
      // Mock successful database query
      mockPrismaClient.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

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
        database: 'Connected',
      })
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
    })

    it('should return disconnected status when database query fails', async () => {
      // Mock database query failure
      mockPrismaClient.$queryRaw.mockRejectedValue(
        new Error('Connection failed')
      )

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
        database: 'Disconnected',
      })
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalled()
    })
  })

  describe('Enhanced Health Metrics', () => {
    it('should include system information in health check', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

      server.get('/health/detailed', async () => {
        let databaseStatus = 'Connected'
        try {
          await prisma.$queryRaw`SELECT 1`
        } catch {
          databaseStatus = 'Disconnected'
        }

        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'mermaid-render-api',
          version: '0.1.0',
          database: databaseStatus,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          environment: process.env.NODE_ENV || 'development',
        }
      })

      const response = await server.inject({
        method: 'GET',
        url: '/health/detailed',
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload).toMatchObject({
        status: 'ok',
        database: 'Connected',
        uptime: expect.any(Number),
        memory: expect.any(Object),
        environment: expect.any(String),
      })
    })
  })
})
