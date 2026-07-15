import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBUMljyuy0HbhPfv76N9BxEz1vH74V_S_4',
  authDomain: 'e-commerce-app-caa0d.firebaseapp.com',
  projectId: 'e-commerce-app-caa0d',
  storageBucket: 'e-commerce-app-caa0d.firebasestorage.app',
  messagingSenderId: '371755640907',
  appId: '1:371755640907:web:5c9bd1959e4f0b21ecc5ce',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const products = [
  {
    title: 'Wireless Headphones',
    price: 129.99,
    category: 'electronics',
    description: 'Immersive sound with active noise cancellation and a long battery life.',
    image: 'https://placehold.co/600x600?text=Headphones',
    rating: { rate: 4.6, count: 120 },
  },
  {
    title: 'Leather Tote Bag',
    price: 79.99,
    category: 'fashion',
    description: 'A stylish everyday bag with roomy compartments and premium leather.',
    image: 'https://placehold.co/600x600?text=Tote+Bag',
    rating: { rate: 4.3, count: 85 },
  },
  {
    title: 'Ceramic Coffee Mug',
    price: 18.5,
    category: 'home',
    description: 'A durable ceramic mug perfect for coffee, tea, or warm drinks.',
    image: 'https://placehold.co/600x600?text=Coffee+Mug',
    rating: { rate: 4.1, count: 64 },
  },
  {
    title: 'Smart Watch',
    price: 199.99,
    category: 'electronics',
    description: 'Track fitness, receive notifications, and stay connected all day.',
    image: 'https://placehold.co/600x600?text=Smart+Watch',
    rating: { rate: 4.7, count: 142 },
  },
  {
    title: 'Minimalist Sneakers',
    price: 89.99,
    category: 'fashion',
    description: 'Comfortable everyday sneakers with a simple modern design.',
    image: 'https://placehold.co/600x600?text=Sneakers',
    rating: { rate: 4.4, count: 97 },
  },
]

for (const product of products) {
  await addDoc(collection(db, 'products'), product)
  console.log(`Added: ${product.title}`)
}

console.log('Finished seeding products.')
