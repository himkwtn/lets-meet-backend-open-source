import { Party } from './party'

export const createUser = (name, photoUrl): UserView => ({
    name,
    avatar: photoUrl,
    instanceId: [],
    token: [],
    stats: {
        partiesCreated: 0,
        partiesJoined: 0,
        partiesDeclined: 0
    },
    currentParties: []
})

export interface UserView {
    name: string
    avatar?: string
    stats: UserStat
    instanceId: string[]
    token: string[]
    currentParties?: Party['id'][]
}

export interface User extends UserView {
    id: string
}

export interface UserStat {
    partiesCreated: number
    partiesJoined: number
    partiesDeclined: number
}
