import { PollChoice } from './pollChoice'

export interface Poll {
    id: string
    title: string
    type: 'SINGLE' | 'MULTIPLE' | 'LOCATION'
    choice: PollChoice
}
