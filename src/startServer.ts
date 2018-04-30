import { importSchema } from 'graphql-import'
import { GraphQLServer } from 'graphql-yoga'
import * as path from 'path'

import { resolvers } from './resolvers'
import { createTypeormConnection } from './utils/createTypeormConnection'

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, './schema.graphql'))

  const server = new GraphQLServer({ typeDefs, resolvers })
  await createTypeormConnection()
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000
  })
  console.log('Server is running on localhost:4000')

  return app
}
