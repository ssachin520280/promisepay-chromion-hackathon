// admin.ts

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n" + process.env.FIREBASE_PRIVATE_KEY + "\n-----END PRIVATE KEY-----\n";
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;

console.log("Initializing Firebase Admin...");

console.log("admin.ts: Preparing to initialize Firebase Admin");

const initFirebaseAdmin = () => {
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing Firebase Admin environment variables');
    }

    const apps = getApps();
    if (apps.length === 0) {
        console.log('admin.ts: Firebase Admin not initialized. Initializing...');
        const app = initializeApp({
            credential: cert({
                projectId: FIREBASE_PROJECT_ID,
                clientEmail: FIREBASE_CLIENT_EMAIL,
                privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
        console.log('admin.ts: Firebase Admin initialized:', app.name);
    } else {
        console.log('admin.ts: Firebase Admin already initialized.');
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    };
};

// Run a test to confirm Firestore connection
const testFirestore = async () => {
    try {
        const { db } = initFirebaseAdmin();
        console.log("admin.ts: Firestore connection acquired.");
        const testDoc = db.collection("test").doc("ping");
        await testDoc.set({ timestamp: new Date() });
        console.log("admin.ts: Successfully wrote ping document to Firestore.");
    } catch (error) {
        console.error("admin.ts: Error testing Firestore:", error);
    }
};

testFirestore();

export const { auth, db } = initFirebaseAdmin();

