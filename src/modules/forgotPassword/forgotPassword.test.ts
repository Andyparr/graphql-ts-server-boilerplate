import { createTypeormConn } from '../../utils/createTypeormConn'
import { User } from '../../entity/User'
import { Connection } from 'typeorm'
import { TestClient } from '../../utils/TestClient'
import { createForgotPasswordLink } from '../../utils/createForgotPasswordlLink'
import * as Redis from 'ioredis'
import { forgotPasswordLockAccount } from '../../utils/forgotPasswordLockAccount'
import { forgotPasswordLockedError } from '../login/errorMessages'
import { passwordNotLongEnough } from '../register/errorMessages'
import { expiredKeyError } from './errorMessages'

let conn: Connection
const redis = new Redis()
const email = 'bob5@bob.com'
const password = 'jlkajoioiqwe'
const newPassword = 'kjhghgjkhjm'

let userId: string
beforeAll(async () => {
  conn = await createTypeormConn()
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save()
  userId = user.id
})

afterAll(async () => {
  conn.close()
})

describe('forgot password', () => {
  test('able to reset password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    // lock account
    await forgotPasswordLockAccount(userId, redis)
    const url = await createForgotPasswordLink('', userId, redis)

    const parts = url.split('/')
    const key = parts[parts.length - 1]

    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: 'email',
            message: forgotPasswordLockedError
          }
        ]
      }
    })

    //
    expect(await client.forgotPasswordChange('a', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'newPassword',
            message: passwordNotLongEnough
          }
        ]
      }
    })

    const response = await client.forgotPasswordChange(newPassword, key)

    expect(response.data).toEqual({
      forgotPasswordChange: null
    })

    expect(await client.forgotPasswordChange('kjdhwekdhwek', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'key',
            message: expiredKeyError
          }
        ]
      }
    })

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    })
  })
})
