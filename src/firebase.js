import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// Configuración de Firebase (reemplaza con tus credenciales)
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

export { auth };