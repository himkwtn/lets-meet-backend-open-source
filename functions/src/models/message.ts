import { User } from './user'

export interface MessageView {
    content: string
    time: string
    sender: User['id']
}

export interface Message extends MessageView {
    id: string
}

export interface SendMessage {
    party: string
    content: string
}
