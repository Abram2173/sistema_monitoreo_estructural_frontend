import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Para almacenamiento, si lo necesitas
import { getFirestore } from 'firebase/firestore'; // Para base de datos, si lo necesitas

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDk2eC47n6j2_k4tyk5Bk_T33J_7F9eBKM",
  authDomain: "loginfirebase-3585d.firebaseapp.com",
  projectId: "loginfirebase-3585d",
  storageBucket: "loginfirebase-3585d.firebasestorage.app",
  messagingSenderId: "552364437515",
  appId: "1:552364437515:web:49f1770342419dd6ce570e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app); // Opcional
const firestore = getFirestore(app); // Opcional

export { auth, storage, firestore }; // Exporta más módulos si los usas