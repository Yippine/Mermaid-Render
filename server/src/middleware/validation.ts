import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

// Common validation schemas
export const commonSchemas = {
  // ID validation
  id: z.string().uuid('Invalid UUID format'),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),

  // Basic string validation
  nonEmptyString: z.string().trim().min(1, 'Field cannot be empty'),

  // Graph related schemas
  graphTitle: z
    .string()
    .min(1)
    .max(255, 'Title must be between 1 and 255 characters'),
  mermaidContent: z.string().min(1, 'Mermaid content cannot be empty'),
}

// Graph creation validation schema
export const createGraphSchema = z.object({
  title: commonSchemas.graphTitle,
  content: commonSchemas.mermaidContent,
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).max(10).default([]),
})

// Generic validation middleware
export function validateSchema<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validation = schema.safeParse(request.body)

      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: 'Validation failed',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
          timestamp: new Date().toISOString(),
        })
      }

      // Replace request body with validated data
      request.body = validation.data
    } catch {
      return reply.status(500).send({
        error: true,
        message: 'Internal validation error',
        timestamp: new Date().toISOString(),
      })
    }
  }
}

// Query parameter validation
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validation = schema.safeParse(request.query)

      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: 'Invalid query parameters',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
          timestamp: new Date().toISOString(),
        })
      }

      request.query = validation.data
    } catch {
      return reply.status(500).send({
        error: true,
        message: 'Internal validation error',
        timestamp: new Date().toISOString(),
      })
    }
  }
}

// URL parameter validation
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validation = schema.safeParse(request.params)

      if (!validation.success) {
        return reply.status(400).send({
          error: true,
          message: 'Invalid URL parameters',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
          timestamp: new Date().toISOString(),
        })
      }

      request.params = validation.data
    } catch {
      return reply.status(500).send({
        error: true,
        message: 'Internal validation error',
        timestamp: new Date().toISOString(),
      })
    }
  }
}
