import { Message } from './message'
import { User } from './user'
import { Poll } from './poll'

export interface Chat {
    read: User['id'][]
    currentPoll?: Poll
}

export const emptyChat: Chat = {
    read: []
}
