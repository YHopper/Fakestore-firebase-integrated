import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBUMljyuy0HbhPfv76N9BxEz1vH74V_S_4',
  authDomain: 'e-commerce-app-caa0d.firebaseapp.com',
  projectId: 'e-commerce-app-caa0d',
  storageBucket: 'e-commerce-app-caa0d.firebasestorage.app',
  messagingSenderId: '371755640907',
  appId: '1:371755640907:web:5c9bd1959e4f0b21ecc5ce',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db, firebaseConfig }
