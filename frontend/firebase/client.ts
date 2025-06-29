// client.ts

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZjoV6O5jTe3zeSKqSC2YeydivE_9crdI",
    authDomain: "promisepay-ce3a2.firebaseapp.com",
    projectId: "promisepay-ce3a2",
    storageBucket: "promisepay-ce3a2.appspot.com",
    messagingSenderId: "327721040140",
    appId: "1:327721040140:web:ec4e658cabd3336d763129",
    measurementId: "G-PQQ5RRF4ZQ",
};

console.log("Checking Firebase App status...");

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider(); 
