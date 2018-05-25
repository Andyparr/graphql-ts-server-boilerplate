import { User } from '../../entity/User'
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from './errorMessages'
import { createTypeormConn } from '../../utils/createTypeormConn'
import { Connection } from 'typeorm'
import { TestClient } from '../../utils/TestClient'

const email = 'tom@bob.com'
const password = 'jalksdf'

let conn: Connection
beforeAll(async () => {
  conn = await createTypeormConn()
})
afterAll(async () => {
  conn.close()
})

describe('Register user', async () => {
  test('check for duplicate emails', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    // make sure we can register a user
    const response = await client.register(email, password)
    expect(response.data).toEqual({ register: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)

    const response2: any = await client.register(email, password)
    expect(response2.data.register).toHaveLength(1)
    expect(response2.data.register[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    })
  })

  test('check bad email', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    const response: any = await client.register('as', password)
    expect(response.data).toEqual({
      register: [
        {
          path: 'email',
          message: emailNotLongEnough
        },
        {
          path: 'email',
          message: invalidEmail
        }
      ]
    })
  })

  test('check bad password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    const response: any = await client.register(email, 'as')
    expect(response.data).toEqual({
      register: [
        {
          path: 'password',
          message: passwordNotLongEnough
        }
      ]
    })
  })

  test('check bad password and bad email', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    const response: any = await client.register('as', 'as')
    expect(response.data).toEqual({
      register: [
        {
          path: 'email',
          message: emailNotLongEnough
        },
        {
          path: 'email',
          message: invalidEmail
        },
        {
          path: 'password',
          message: passwordNotLongEnough
        }
      ]
    })
  })
})
