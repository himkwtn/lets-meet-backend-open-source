import { User } from './user'
import { Chat, emptyChat } from './chat'
import shortid = require('shortid')

export interface PartyView {
    location: string
    members: User['id'][]
    topic: string
    code: string
    chat: Chat
    time: String
    public: boolean
}

export interface Party extends PartyView {
    id: string
}

export interface CreateParty {
    location: string
    topic: string
    time: string
    public: boolean
}

export interface EditParty extends CreateParty {
    party: string
}

export const createNewParty = (
    data: CreateParty,
    userId: string
): PartyView => {
    return {
        ...data,
        code: shortid.generate(),
        chat: emptyChat,
        members: [userId]
    }
}
