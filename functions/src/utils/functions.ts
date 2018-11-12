import * as functions from 'firebase-functions'
import { CallableContext } from 'firebase-functions/lib/providers/https'
import admin from './admin'

export const { onCall, onRequest, HttpsError } = functions.https
export const { document } = functions.firestore
export const auth = functions.auth.user()
export const messaging = admin.messaging()

export const checkAuth = (context: CallableContext) => {
    const { auth: authen } = context
    if (!authen) {
        throw new HttpsError('unauthenticated', 'User must be authenticated')
    }
}

export const addToArray = admin.firestore.FieldValue.arrayUnion
export const removeFromArray = admin.firestore.FieldValue.arrayRemove

export const checkIfExist = (docRef: FirebaseFirestore.DocumentReference) =>
    docRef.get().then(doc => doc.exists)

const getProp = (path: string[], obj: any): any =>
    path.reduce((previousResult, currentKey) => previousResult[currentKey], obj)

const createObject = (obj, keys: any[], value) => {
    if (keys.length === 1) {
        obj[keys[0]] = value
    } else {
        const key = keys.shift()
        obj[key] = createObject(
            typeof obj[key] === 'undefined' ? {} : obj[key],
            keys,
            value
        )
    }
    return obj
}

export const increment = async (
    docRef: FirebaseFirestore.DocumentReference,
    path: string[],
    value: number
) => {
    const doc = (await docRef.get()).data()
    const oldValue = getProp(path, doc) || 0
    const newValue = oldValue + value
    const updatedField = createObject({}, path, newValue)
    return docRef.set(updatedField, { merge: true }).then(res => {
        const obj = {
            ...doc,
            ...updatedField
        }
        return obj
    })
}
