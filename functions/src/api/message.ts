import { messaging, document } from '../utils/functions'
import { HttpsError } from 'firebase-functions/lib/providers/https'
import { MessageView } from '../models/message'

import { partiesRef, usersRef } from '../utils/db'
import { UserView } from '../models/user'
import { EventContext } from 'firebase-functions'

export const notifyNewMessage = document(
    'parties/{party}/messages/{message}'
).onCreate(async (snap, context: EventContext) => {
    const { content, sender: senderId } = snap.data() as MessageView

    const { party } = context.params
    await usersRef
        .where('currentParties', 'array-contains', party)
        .get()
        .then(async users => {
            const partyDB = await partiesRef.doc(party).get()
            const usersToNotify: UserView[] = []
            let sender: UserView
            users.forEach(user => {
                if (user.id !== senderId)
                    usersToNotify.push(user.data() as UserView)
                else sender = user.data() as UserView
            })
            const token = usersToNotify
                .map(user => user.token)
                .reduce((a, b) => a.concat(b), [])
            const payload = {
                data: {
                    title: `${partyDB.data().topic}`,
                    body: `${sender.name}: ${content}`,
                    partyId: party,
                    icon: sender.avatar
                }
            }
            return messaging.sendToDevice(token, payload).catch(err => {
                throw new HttpsError('internal', err)
            })
        })
        .catch(err => {
            throw new HttpsError('internal', err)
        })
})
