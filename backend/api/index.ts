import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { corsMiddleware } from '../src/middleware/cors'
import { errorHandler } from '../src/middleware/errorHandler'
import { rateLimiter } from '../src/middleware/rateLimiter'
import { apiRouter } from '../src/routes'
import { config } from '../src/config'
import { AppError } from '../src/errors'
import { ErrorCode } from '../src/shared'

const app = new Hono()

app.use('*', corsMiddleware())
app.use('*', errorHandler())
app.use('/api/*', rateLimiter('global'))

app.route(config.apiPrefix, apiRouter)

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: { code: ErrorCode.NOT_FOUND, message: `Route not found: ${c.req.method} ${c.req.path}` },
    },
    404,
  )
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
export const OPTIONS = handle(app)