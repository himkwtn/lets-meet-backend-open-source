import { User } from './user'

export interface PollChoice {
    id: string
    text: string
    selected: User['id'][]
}
