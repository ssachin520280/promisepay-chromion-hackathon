// admin.ts

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const FIREBASE_PROJECT_ID = "promisepay-ce3a2";
const FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n" + "MIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQDEiJnzvfNUh0zA\n/+9F+cE3QmUkVhTJzBiTAJIMJbrogA5Wk8Cz0zDBdBDAHqlteRVObk92jZ3tDCCB\n8IJ02xwpWDvMvL5NdI631H3OMvMbQNwvFS1LdvkoiTLajpwxwR6PcbtZp4LhQKQL\n1AFTnQazYI7D3X/ekY7odUHxeNXvBG7zV7I1BEO2/muEAp2E6BSoJx7dCxgVjinN\naadjxhYaFkD8TJNJ9JRH1jBVzTM1dcdxgDwdam2C7BegCQpubDal3HpJlaMfXtP9\nKLFdudfio/BqVZ6VcEdb6WgtOYGjUwRgEy3Fr5dioSqDMth7a/EtHfOvCdVmhdqI\nudZwcxw5AgMBAAECgf9/N+2UtWDN6RBYcMFNrzmsi5c2N14Y+XJckW+vkeFrep3N\nbUUHIomRi9lL8WiWmThWHxHjYu0gziaF9k58MaKbae/eBb0qHSSObP5we68rq/Uk\nzkdfJH/bdGIJF/5MyP7/SXshsnHhptGujUSXtsSfoeFanyuUVO3j1N7a3jjCNYwS\n6br8EH0zJKLg3Rl1/v8UP2Xw3WrniXuKs2B4KaN8Wxd6N7QWuTqCrM6UcKOcibyI\n92/eIPXrCTzZjtYmlOCkzf2iS0T3j2ZmgayCe93IUwJTq2WWPxJottNh8iwpr2yG\nfdJJW/CEDYtiRtG8znlhiY+0+gWbSlHIKSH35WECgYEA6nungM2N94Ki5VYl/MgR\nl2DCbTyj6eDHi6kfwY8rk6h/qiv2vd3XP3zycYzHVjSFiKl9bMY5h0rwPguK8nkq\nv509AO1mf4c+PdU6htKpBa5dhlClQZ2BC171VtLpq6VpQTZNSsfUgiGOFr0nycA8\nOQRpE+HAjG6oqjxIL4wEEZ8CgYEA1pF1yriNLgDXzhc9w/zpNB1OVDRMzld+hDMD\nLp2zgFasNRXQ63WbS9L7wGCyUza72H0275i+oGiKZTttzkGha98u0ypPSc/IoF5d\nR22w5vqZ77cYg6Jqr3/uoRfLqwKL8hC+uvLDVzZ+PUAj5vw0sF2ngE6pe7VlP2oo\nS1PWcycCgYB9ghiDagMuU39rr/P/XPuFgmYvYEEAY6+Lgsgbq82QaKWE6alVsZOQ\nSQngW5ErBEvhfY9EFMogL61uGHGUHeUS0VAg2fF+G17ma+a62bFc+BrZVPtPpsW2\n12oMwjIPDSfMnws6FsIZsWpDo5XTeJEDl+fCm5ib0nN3Q3MD+DcJUwKBgBFTdZuF\nA4Fvd/2gStCEn6Ahra2G+5y92+144QzmlxQJ66XtuQ0KVhvtUX7bUAsAJHL6yXDX\neK0jQ+mgvuEk05AOWY2boQNoz96DQC0AYoSEP+HnewdGGi9JuU8wyLVqYzqMt5oI\n+FUWhWMUxtFkFC0ZoujtcSoYH7DbNZ2/i1WJAoGAC8oFKSzXvt+P/kPusAvg9j7L\nGTjzTn1BsWIqcjo0Gl30XuPKYxEgPeUnCZDx9C9aztkNR8wVc+OzM8HRD3lLTirP\neK/zQP88wQKteSTLJyzvFcBPB36DOCfdMAF0YwxgxV6TibZDpux/MBT1IsEPcxY7\ncfnBxCgOcG57E4adbY0=" + "\n-----END PRIVATE KEY-----\n";
const FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@promisepay-ce3a2.iam.gserviceaccount.com";

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

