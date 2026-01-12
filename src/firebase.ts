import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getDatabase} from "firebase/database";

// Configurazione Firebase (sostituisci con i tuoi dati dal Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyDFAX9ndziscjdtGM_4dPAodPFC_Y0Wf3o",
    authDomain: "velin-chats.firebaseapp.com",
    projectId: "velin-chats",
    storageBucket: "velin-chats.firebasestorage.app",
    messagingSenderId: "957786615133",
    appId: "1:957786615133:web:1065de500aa5f27abd0cb4",
    measurementId: "G-QKF87TQS2V"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta i servizi
export const auth = getAuth(app);
export const database = getDatabase(app);
