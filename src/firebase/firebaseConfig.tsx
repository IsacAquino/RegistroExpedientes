import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAc6bXvwqw5N6Jngvd69erTJ5aTCgMkDbU",
    authDomain: "expedientes-1219b.firebaseapp.com",
    projectId: "expedientes-1219b",
    storageBucket: "expedientes-1219b.firebasestorage.app",
    messagingSenderId: "884998683566",
    appId: "1:884998683566:web:8fa466a25ee43710f8263f",
    measurementId: "G-YTZWX8W2J4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
