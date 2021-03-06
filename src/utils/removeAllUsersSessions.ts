import { Redis } from 'ioredis'
import { userSessionIdPrefix, redisSessionPrefix } from '../constants'

export const removeAllUsersSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  )
  const promises = []
  for (const id of sessionIds) {
    promises.push(redis.del(`${redisSessionPrefix}${id}`))
  }
  await Promise.all(promises)
}
