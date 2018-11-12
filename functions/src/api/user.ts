import { db, usersRef } from '../utils/db'
import { auth, checkAuth, addToArray } from '../utils/functions'
import { createUser, User } from '../models/user'
import {
    onCall,
    CallableContext,
    HttpsError
} from 'firebase-functions/lib/providers/https'

export const initUser = auth.onCreate(user => {
    const { uid, displayName, photoURL } = user
    const newUser = createUser(displayName, photoURL)
    return db
        .collection('users')
        .doc(uid)
        .set(newUser)
        .then(_ => {
            const createdUser: User = {
                ...newUser,
                id: uid
            }
            return createdUser
        })
})

export const saveInstanceId = onCall(
    ({ id }: { id: string }, ctx: CallableContext) => {
        try {
            checkAuth(ctx)
        } catch (e) {
            throw e
        }

        return usersRef
            .doc(ctx.auth.uid)
            .update({ instanceId: addToArray(id) })
            .catch(err => {
                throw new HttpsError('internal', err)
            })
    }
)

export const saveToken = onCall(
    ({ token }: { token: string }, ctx: CallableContext) => {
        try {
            checkAuth(ctx)
        } catch (e) {
            throw e
        }

        return usersRef
            .doc(ctx.auth.uid)
            .update({ token: addToArray(token) })
            .catch(err => {
                throw new HttpsError('internal', err)
            })
    }
)
