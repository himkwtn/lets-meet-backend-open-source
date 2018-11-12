import { User } from './user'
import { Chat } from './chat'

export interface Group {
    id: string
    members: User['id'][]
    chat: Chat
}
