import { Redis } from 'ioredis'

export interface ResolverMap {
  [key: string]: {
    [key: string]: (
      parent: any,
      args: any,
      contest: { redis: Redis; url: string },
      info: any
    ) => any
  }
}
