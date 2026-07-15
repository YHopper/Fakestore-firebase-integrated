import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword as signInFirebaseWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, db } from './firebase'
import type { Order, OrderItem, Product, UserProfile } from './types'

const usersCollection = collection(db, 'users')
const productsCollection = collection(db, 'products')
const ordersCollection = collection(db, 'orders')

const mockProducts: Product[] = [
  {
    id: 'mock-1',
    title: 'Wireless Headphones',
    price: 129.99,
    category: 'electronics',
    description: 'Immersive sound with active noise cancellation and a long battery life.',
    image: 'https://placehold.co/600x600?text=Headphones',
    rating: { rate: 4.6, count: 120 },
  },
  {
    id: 'mock-2',
    title: 'Leather Tote Bag',
    price: 79.99,
    category: 'fashion',
    description: 'A stylish everyday bag with roomy compartments and premium leather.',
    image: 'https://placehold.co/600x600?text=Tote+Bag',
    rating: { rate: 4.3, count: 85 },
  },
  {
    id: 'mock-3',
    title: 'Ceramic Coffee Mug',
    price: 18.5,
    category: 'home',
    description: 'A durable ceramic mug perfect for coffee, tea, or warm drinks.',
    image: 'https://placehold.co/600x600?text=Coffee+Mug',
    rating: { rate: 4.1, count: 64 },
  },
  {
    id: 'mock-4',
    title: 'Smart Watch',
    price: 199.99,
    category: 'electronics',
    description: 'Track fitness, receive notifications, and stay connected all day.',
    image: 'https://placehold.co/600x600?text=Smart+Watch',
    rating: { rate: 4.7, count: 142 },
  },
  {
    id: 'mock-5',
    title: 'Minimalist Sneakers',
    price: 89.99,
    category: 'fashion',
    description: 'Comfortable everyday sneakers with a simple modern design.',
    image: 'https://placehold.co/600x600?text=Sneakers',
    rating: { rate: 4.4, count: 97 },
  },
]

const normalizeProduct = (docSnapshot: { id: string; data: () => Record<string, unknown> }): Product => {
  const data = docSnapshot.data() as unknown as Partial<Product>

  return {
    id: docSnapshot.id,
    title: typeof data.title === 'string' ? data.title : 'Untitled product',
    price: typeof data.price === 'number' ? data.price : 0,
    category: typeof data.category === 'string' ? data.category : 'uncategorized',
    description: typeof data.description === 'string' ? data.description : '',
    image: typeof data.image === 'string' ? data.image : '',
    rating: data.rating && typeof data.rating === 'object' && 'rate' in data.rating && 'count' in data.rating
      ? {
          rate: typeof data.rating.rate === 'number' ? data.rating.rate : 0,
          count: typeof data.rating.count === 'number' ? data.rating.count : 0,
        }
      : { rate: 0, count: 0 },
  }
}

export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const profile: UserProfile = {
    id: credential.user.uid,
    email: credential.user.email ?? email,
    name,
    address: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await setDoc(doc(usersCollection, credential.user.uid), profile)
  return credential.user
}

export const signInWithEmailAndPassword = async (email: string, password: string): Promise<User> => {
  const credential = await signInFirebaseWithEmailAndPassword(auth, email, password)
  return credential.user
}

export const logOut = async (): Promise<void> => {
  await signOut(auth)
}

export const listenToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const snapshot = await getDoc(doc(usersCollection, userId))
  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as UserProfile
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  await updateDoc(doc(usersCollection, userId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

export const deleteUserAccount = async (userId: string): Promise<void> => {
  const userOrdersQuery = query(ordersCollection, where('userId', '==', userId))
  const ordersSnapshot = await getDocs(userOrdersQuery)

  await Promise.all(ordersSnapshot.docs.map((orderSnapshot) => deleteDoc(orderSnapshot.ref)))
  await deleteDoc(doc(usersCollection, userId))

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      await deleteUser(auth.currentUser)
    } catch {
      // Firebase may require recent authentication before deleting the account.
      // We still remove the Firestore profile and sign the user out.
    }
  }
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(productsCollection)

    if (!snapshot.empty) {
      return snapshot.docs.map(normalizeProduct).sort((left, right) => left.title.localeCompare(right.title))
    }
  } catch (error) {
    console.warn('Falling back to the demo storefront catalog.', error)
  }

  return mockProducts
}

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const documentRef = await addDoc(productsCollection, product)
  return {
    id: documentRef.id,
    ...product,
  }
}

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  await updateDoc(doc(productsCollection, productId), updates)
}

export const deleteProduct = async (productId: string): Promise<void> => {
  await deleteDoc(doc(productsCollection, productId))
}

export const createOrder = async (
  userId: string,
  userEmail: string,
  items: OrderItem[],
  total: number,
): Promise<Order> => {
  const documentRef = await addDoc(ordersCollection, {
    userId,
    userEmail,
    items,
    total,
    status: 'completed',
    createdAt: new Date().toISOString(),
  })

  return {
    id: documentRef.id,
    userId,
    userEmail,
    items,
    total,
    status: 'completed',
    createdAt: new Date().toISOString(),
  }
}

export const fetchOrdersForUser = async (userId: string): Promise<Order[]> => {
  const userOrdersQuery = query(ordersCollection, where('userId', '==', userId))
  const snapshot = await getDocs(userOrdersQuery)

  return snapshot.docs
    .map((docSnapshot) => ({
      id: docSnapshot.id,
      ...(docSnapshot.data() as Omit<Order, 'id'>),
    }))
    .sort((left, right) => (right.createdAt ?? '').localeCompare(left.createdAt ?? ''))
}
