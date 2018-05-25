import { createTypeormConn } from '../../utils/createTypeormConn'
import { User } from '../../entity/User'
import { Connection } from 'typeorm'
import { TestClient } from '../../utils/TestClient'

let conn: Connection
const email = 'bob5@bob.com'
const password = 'jlkajoioiqwe'

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

describe('logout', () => {
  test('test logging out a user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    await client.login(email, password)

    const response = await client.me()

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    })

    await client.logout()

    const response2 = await client.me()

    expect(response2.data.me).toBeNull()
  })

  test('logout of multiple sessions', async () => {
    const session1 = new TestClient(process.env.TEST_HOST as string)
    const session2 = new TestClient(process.env.TEST_HOST as string)

    await session1.login(email, password)
    await session2.login(email, password)
    expect(await session1.me()).toEqual(await session2.me())
    await session1.logout()
    expect(await session1.me()).toEqual(await session2.me())
  })
})
