import { useEffect, useState } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from './useAuth.jsx'

export function useTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setTrips([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'trips'),
      where('owner_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTrips(tripsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const createTrip = async (tripData) => {
    if (!user) return
    
    // Use a transaction or multiple writes to handle trip + initial member
    const tripRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      owner_id: user.uid,
      created_at: serverTimestamp()
    })

    await setDoc(doc(db, 'trip_members', `${tripRef.id}_${user.uid}`), {
      trip_id: tripRef.id,
      user_id: user.uid,
      role: 'owner',
      joined_at: serverTimestamp()
    })

    const newTripDoc = await getDoc(tripRef)
    return { id: tripRef.id, ...newTripDoc.data() }
  }

  const deleteTrip = async (tripId) => {
    // Delete related documents first
    const collectionsToClean = ['trip_members', 'suggestions', 'share_links']
    
    for (const colName of collectionsToClean) {
      const q = query(collection(db, colName), where('trip_id', '==', tripId))
      const snapshot = await getDocs(q)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    }

    // Finally delete the trip itself
    await deleteDoc(doc(db, 'trips', tripId))
  }

  return { trips, loading, createTrip, deleteTrip }
}

export function useTrip(tripId) {
  const [trip, setTrip] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!tripId) return

    setLoading(true)

    // Listen to trip document
    const unsubscribeTrip = onSnapshot(doc(db, 'trips', tripId), (doc) => {
      if (doc.exists()) {
        setTrip({ id: doc.id, ...doc.data() })
      }
      setLoading(false)
    })

    // Listen to suggestions
    const qSugg = query(
      collection(db, 'suggestions'),
      where('trip_id', '==', tripId),
      orderBy('created_at')
    )
    const unsubscribeSugg = onSnapshot(qSugg, (snapshot) => {
      setSuggestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    // Listen to members
    const qMemb = query(
      collection(db, 'trip_members'),
      where('trip_id', '==', tripId)
    )
    const unsubscribeMemb = onSnapshot(qMemb, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => {
      unsubscribeTrip()
      unsubscribeSugg()
      unsubscribeMemb()
    }
  }, [tripId])

  const saveSuggestions = async (type, content) => {
    if (!user || !tripId) return
    const suggId = `${tripId}_${type}`
    const suggRef = doc(db, 'suggestions', suggId)
    
    await setDoc(suggRef, {
      trip_id: tripId,
      type,
      content,
      created_by: user.uid,
      created_at: serverTimestamp()
    }, { merge: true })

    const updated = await getDoc(suggRef)
    return { id: updated.id, ...updated.data() }
  }

  const updateTrip = async (updates) => {
    if (!tripId) return
    const tripRef = doc(db, 'trips', tripId)
    await updateDoc(tripRef, updates)
    const updated = await getDoc(tripRef)
    const data = { id: updated.id, ...updated.data() }
    setTrip(data)
    return data
  }

  const getSuggestionByType = (type) => suggestions.find(s => s.type === type)?.content

  return { trip, suggestions, members, loading, saveSuggestions, updateTrip, getSuggestionByType }
}

export function useShareTrip(tripId) {
  const { user } = useAuth()

  const createShareLink = async (permission = 'viewer') => {
    if (!user || !tripId) throw new Error('User or trip not found')
    const token = crypto.randomUUID()
    await addDoc(collection(db, 'share_links'), {
      trip_id: tripId,
      token,
      permission,
      created_by: user.uid,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: serverTimestamp()
    })
    return `${globalThis.location.origin}/join/${token}`
  }

  const joinViaToken = async (token) => {
    if (!user) throw new Error('Must be logged in to join')
    
    const q = query(collection(db, 'share_links'), where('token', '==', token))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) throw new Error('Invalid or expired invite link')
    const link = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
    
    if (new Date(link.expires_at) < new Date()) throw new Error('This invite link has expired')

    await setDoc(doc(db, 'trip_members', `${link.trip_id}_${user.uid}`), {
      trip_id: link.trip_id,
      user_id: user.uid,
      role: link.permission,
      joined_at: serverTimestamp()
    }, { merge: true })

    return link.trip_id
  }

  return { createShareLink, joinViaToken }
}
