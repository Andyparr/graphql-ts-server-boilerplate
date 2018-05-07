import { GraphQLServer } from 'graphql-yoga'

import { createTypeormConnection } from './utils/createTypeormConnection'
import { redis } from './redis'
import { confirmEmail } from './routes/confirmEmail'
import { genSchema } from './utils/genSchema'

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host')
    })
  })

  server.express.get('/confirm/:id', confirmEmail)

  await createTypeormConnection()
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000
  })
  console.log('🚀 Server is running on localhost:4000')

  return app
}
