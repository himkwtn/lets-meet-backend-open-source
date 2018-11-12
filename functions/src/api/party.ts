import {
    Party,
    CreateParty,
    PartyView,
    EditParty,
    createNewParty
} from '../models/party'
import { partiesRef, usersRef } from '../utils/db'
import {
    onCall,
    HttpsError,
    checkAuth,
    checkIfExist,
    document
} from '../utils/functions'
import { CallableContext } from 'firebase-functions/lib/providers/https'
import {
    joinPartyFunc,
    addPartyToUser,
    removePartyFromUser,
    removeUserFromParty,
    incrementStat
} from '../utils/party.functions'
import { EventContext } from 'firebase-functions'

export const createParty = onCall(
    async (data: CreateParty, ctx: CallableContext) => {
        try {
            checkAuth(ctx)
        } catch (e) {
            throw e
        }
        const { uid } = ctx.auth
        const newParty = createNewParty(data, uid)
        try {
            const partyDB = await partiesRef.add(newParty)
            const createdParty: Party = {
                ...newParty,
                id: partyDB.id
            }
            const userRef = usersRef.doc(uid)
            addPartyToUser(userRef, createdParty.id).catch(err => {
                throw err
            })
            incrementStat(userRef, 'partiesCreated', 1).catch(err => {
                throw err
            })
            return JSON.stringify(createdParty)
        } catch (err) {
            throw new HttpsError('internal', err)
        }
    }
)

export const editParty = onCall(
    async ({ party, ...data }: EditParty, ctx: CallableContext) => {
        try {
            checkAuth(ctx)
        } catch (e) {
            throw e
        }

        const partyRef = partiesRef.doc(party)

        if (!(await checkIfExist(partyRef))) {
            throw new HttpsError('not-found', 'This party does not exist.')
        }

        await partyRef.update(data)

        const partyDB = await partyRef.get()
        const editedParty: Party = {
            id: partyDB.id,
            ...(partyDB.data() as PartyView)
        }

        return JSON.stringify(editedParty)
    }
)

export const joinParty = onCall(
    async (data: { party: string }, ctx: CallableContext) => {
        try {
            checkAuth(ctx)
        } catch (e) {
            throw e
        }

        const userId = ctx.auth.uid
        const partyCode = data.party
        const partyRef = partiesRef.where('code', '==', partyCode)

        const partyId = (await partyRef.get()).docs[0].id

        try {
            const joinedParty = await joinPartyFunc(userId, partyId)
            return joinedParty
        } catch (err) {
            throw new HttpsError('internal', err)
        }
    }
)

export const joinPartyById = onCall(
    async (data: { party: string }, ctx: CallableContext) => {
        try {
            checkAuth(ctx)
        } catch (e) {
            throw e
        }

        const userId = ctx.auth.uid
        const partyId = data.party

        try {
            const joinedParty = await joinPartyFunc(userId, partyId)
            return joinedParty
        } catch (err) {
            throw new HttpsError('internal', err)
        }
    }
)

export const leaveParty = onCall(
    async ({ party }: { party: string }, ctx: CallableContext) => {
        try {
            checkAuth(ctx)
        } catch (e) {
            throw e
        }

        const userId = ctx.auth.uid
        const userRef = usersRef.doc(userId)
        await Promise.all([
            removePartyFromUser(userRef, party),
            removeUserFromParty(partiesRef.doc(party), userId)
        ]).catch(err => {
            throw new HttpsError('internal', err)
        })

        incrementStat(userRef, 'partiesDeclined', 1).catch(err => {
            throw new HttpsError('internal', err)
        })

        return true
    }
)

export const deleteEmptyParty = document('parties/{partyId}').onUpdate(
    (change, context: EventContext) => {
        const party = change.after.data() as PartyView
        if (party.members.length === 0) {
            partiesRef
                .doc(context.params.partyId)
                .delete()
                .catch(err => {
                    throw new HttpsError('internal', 'Delete Error')
                })
            return true
        }
        return false
    }
)
