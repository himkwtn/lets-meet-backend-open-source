import admin from './admin'

export const db = admin.firestore()
export const partiesRef = db.collection('parties')
export const usersRef = db.collection('users')
export const auth = admin.auth()
