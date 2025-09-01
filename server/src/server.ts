import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
const prisma = new PrismaClient()

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
})

// 安全性與 CORS
server.register(helmet)
server.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
})

// 限流
server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// 健康檢查端點
server.get('/health', async () => {
  let databaseStatus = 'Connected'
  try {
    // 實際檢查資料庫連接
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

// Hello World API 端點
server.get('/api/hello', async () => {
  let databaseStatus = 'Connected'
  try {
    // 檢查資料庫連接狀態
    await prisma.$queryRaw`SELECT 1`
  } catch {
    databaseStatus = 'Disconnected'
  }

  return {
    message: 'Hello World from Mermaid Render API! 🚀',
    status: 'success',
    server: 'Fastify',
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  }
})

// 基本圖表 API 路由結構
server.get('/api/graphs', async () => {
  return {
    graphs: [],
    message: 'Graph API endpoint ready',
    timestamp: new Date().toISOString(),
  }
})

// 錯誤處理
server.setErrorHandler((error, request, reply) => {
  server.log.error(error)

  const statusCode = error.statusCode || 500
  const errorResponse = {
    error: true,
    message: error.message || 'Internal Server Error',
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  }

  reply.status(statusCode).send(errorResponse)
})

// 404 處理
server.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: true,
    message: 'Route not found',
    path: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
  })
})

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10)
    const host = process.env.HOST || 'localhost'

    await server.listen({ port, host })
    server.log.info(`🚀 Server ready at http://${host}:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// 優雅關閉
process.on('SIGINT', () => {
  server.log.info('Received SIGINT, shutting down gracefully...')
  server.close(async () => {
    await prisma.$disconnect()
    server.log.info('Server closed')
    process.exit(0)
  })
})

start()
