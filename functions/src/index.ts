import { onRequest } from './utils/functions'

export const helloWorld = onRequest((req, res) => {
    res.send('Hello from Firebase!')
})

export * from './api/user'

export * from './api/party'

export * from './api/message'
