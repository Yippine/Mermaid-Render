import Fastify, { FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  validateSchema,
  validateQuery,
  validateParams,
  createGraphSchema,
  commonSchemas,
} from '../../src/middleware/validation'

describe('Validation Middleware', () => {
  let server: ReturnType<typeof Fastify>

  beforeEach(async () => {
    server = Fastify({ logger: false })
  })

  afterEach(async () => {
    await server.close()
  })

  describe('validateSchema', () => {
    beforeEach(async () => {
      server.post(
        '/test',
        {
          preHandler: validateSchema(createGraphSchema),
        },
        async (request: FastifyRequest) => {
          return { success: true, data: request.body }
        }
      )
    })

    it('should accept valid data', async () => {
      const validData = {
        title: 'Test Graph',
        content: 'graph TD\n  A --> B',
        description: 'A test graph',
        isPublic: true,
        tags: ['test', 'sample'],
      }

      const response = await server.inject({
        method: 'POST',
        url: '/test',
        payload: validData,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject(validData)
    })

    it('should reject invalid data with detailed errors', async () => {
      const invalidData = {
        title: '', // Empty title
        content: '', // Empty content
        description: 'a'.repeat(1001), // Too long
        isPublic: 'not-a-boolean', // Wrong type
        tags: Array(11).fill('tag'), // Too many tags
      }

      const response = await server.inject({
        method: 'POST',
        url: '/test',
        payload: invalidData,
      })

      expect(response.statusCode).toBe(400)
      const result = JSON.parse(response.payload)
      expect(result.error).toBe(true)
      expect(result.message).toBe('Validation failed')
      expect(result.details).toHaveLength(5) // 5 validation errors
    })

    it('should apply default values', async () => {
      const minimalData = {
        title: 'Test Graph',
        content: 'graph TD\n  A --> B',
      }

      const response = await server.inject({
        method: 'POST',
        url: '/test',
        payload: minimalData,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.data.isPublic).toBe(false) // Default value
      expect(result.data.tags).toEqual([]) // Default value
    })
  })

  describe('validateQuery', () => {
    beforeEach(async () => {
      server.get(
        '/test',
        {
          preHandler: validateQuery(commonSchemas.pagination),
        },
        async (request: FastifyRequest) => {
          return { success: true, query: request.query }
        }
      )
    })

    it('should accept valid query parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test?page=2&limit=20',
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.query).toEqual({ page: 2, limit: 20 })
    })

    it('should apply default values for missing parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test',
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.query).toEqual({ page: 1, limit: 10 })
    })

    it('should reject invalid query parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test?page=0&limit=101',
      })

      expect(response.statusCode).toBe(400)
      const result = JSON.parse(response.payload)
      expect(result.error).toBe(true)
      expect(result.details).toHaveLength(2)
    })
  })

  describe('validateParams', () => {
    beforeEach(async () => {
      server.get(
        '/test/:id',
        {
          preHandler: validateParams(z.object({ id: commonSchemas.id })),
        },
        async (request: FastifyRequest) => {
          return { success: true, params: request.params }
        }
      )
    })

    it('should accept valid UUID parameter', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      const response = await server.inject({
        method: 'GET',
        url: `/test/${uuid}`,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.params.id).toBe(uuid)
    })

    it('should reject invalid UUID parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test/not-a-uuid',
      })

      expect(response.statusCode).toBe(400)
      const result = JSON.parse(response.payload)
      expect(result.error).toBe(true)
      expect(result.message).toBe('Invalid URL parameters')
    })
  })

  describe('Common Schemas', () => {
    it('should validate UUIDs correctly', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      const invalidUUID = 'not-a-uuid'

      expect(commonSchemas.id.safeParse(validUUID).success).toBe(true)
      expect(commonSchemas.id.safeParse(invalidUUID).success).toBe(false)
    })

    it('should validate non-empty strings', () => {
      expect(commonSchemas.nonEmptyString.safeParse('valid').success).toBe(true)
      expect(commonSchemas.nonEmptyString.safeParse('').success).toBe(false)
      // trim() converts whitespace to empty string, so this will fail validation
      expect(commonSchemas.nonEmptyString.safeParse('   ').success).toBe(false)
    })

    it('should validate graph titles', () => {
      expect(commonSchemas.graphTitle.safeParse('Valid Title').success).toBe(
        true
      )
      expect(commonSchemas.graphTitle.safeParse('').success).toBe(false)
      expect(commonSchemas.graphTitle.safeParse('a'.repeat(256)).success).toBe(
        false
      )
    })
  })
})
