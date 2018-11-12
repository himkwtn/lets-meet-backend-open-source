import { UserView } from '../models/user'
import { partiesRef, usersRef } from './db'
import {
    checkIfExist,
    addToArray,
    removeFromArray,
    increment
} from './functions'
import { HttpsError } from 'firebase-functions/lib/providers/https'
import { PartyView, Party } from '../models/party'

const userIsInParty = (
    userRef: FirebaseFirestore.DocumentReference,
    partyId: string
) =>
    userRef
        .get()
        .then(doc => (doc.data() as UserView).currentParties.includes(partyId))

const updateMembership = (
    updateFunc: (id: string) => FirebaseFirestore.FieldValue,
    field: string
) => (docRef: FirebaseFirestore.DocumentReference, id: string) =>
    docRef.update({ [field]: updateFunc(id) })

const updateMembershipField = {
    user: 'currentParties',
    party: 'members'
}
export const addPartyToUser = updateMembership(
    addToArray,
    updateMembershipField.user
)
export const removePartyFromUser = updateMembership(
    removeFromArray,
    updateMembershipField.user
)

export const addUserToParty = updateMembership(
    addToArray,
    updateMembershipField.party
)
export const removeUserFromParty = updateMembership(
    removeFromArray,
    updateMembershipField.party
)

export const incrementStat = (
    userRef: FirebaseFirestore.DocumentReference,
    field: string,
    value: number
) => increment(userRef, ['stats', field], value)

export const joinPartyFunc = async (userId: string, partyId: string) => {
    const partyRef = partiesRef.doc(partyId)
    const userRef = usersRef.doc(userId)
    if (!(await checkIfExist(partyRef))) {
        throw new HttpsError('not-found', 'This party does not exist.')
    }

    if (!(await userIsInParty(userRef, partyId))) {
        await Promise.all([
            addPartyToUser(userRef, partyId),
            addUserToParty(partyRef, userId)
        ]).catch(err => {
            throw err
        })
        incrementStat(userRef, 'partiesJoined', 1).catch(err => {
            throw err
        })
    }

    const party = await partyRef.get()
    const partyData = party.data() as PartyView
    const joinedParty: Party = {
        id: party.id,
        ...partyData
    }

    return JSON.stringify(joinedParty)
}
