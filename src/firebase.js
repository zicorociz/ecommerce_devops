import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyAy5tdVugIk4tAD_8m6FlSgXkQcNKheENw",
  authDomain: "pso-klp9.firebaseapp.com",
  projectId: "pso-klp9",
  storageBucket: "pso-klp9.appspot.com",
  messagingSenderId: "39575625516",
  appId: "1:39575625516:web:b0d5c844b239ea18585689",
  measurementId: "G-6V6T4T7M1S"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
