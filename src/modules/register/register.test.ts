import { request } from 'graphql-request'

import { User } from '../../entity/User'
import { startServer } from '../../startServer'
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from './errorMessages'

let getHost = () => ''

beforeAll(async () => {
  const app = await startServer()
  const { port } = app.address()
  getHost = () => `http://127.0.0.1:${port}`
})

const validEmail = 'test@email.com'
const validPassword = 'testpassword'

const mutation = (email: string, password: string) => `
mutation {
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}
`

test('Register user successfully', async () => {
  const response = await request(getHost(), mutation(validEmail, validPassword))
  expect(response).toEqual({ register: null })
  const users = await User.find({ where: { validEmail } })
  expect(users).toHaveLength(1)
  const user = users[0]
  expect(user.email).toEqual(validEmail)
  expect(user.password).not.toEqual(validPassword)
})

test('Register user with duplicate email', async () => {
  const response: any = await request(
    getHost(),
    mutation(validEmail, validPassword)
  )
  expect(response.register).toHaveLength(1)
  expect(response.register[0]).toEqual({
    path: 'email',
    message: duplicateEmail
  })
})

test('Invalid email error', async () => {
  const response: any = await request(getHost(), mutation('te', validPassword))
  expect(response).toEqual({
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

test('Invalid password error', async () => {
  const response: any = await request(getHost(), mutation(validEmail, 'te'))
  expect(response).toEqual({
    register: [
      {
        path: 'password',
        message: passwordNotLongEnough
      }
    ]
  })
})

test('Invalid email and password error', async () => {
  const response: any = await request(getHost(), mutation('te', 'te'))
  expect(response).toEqual({
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
