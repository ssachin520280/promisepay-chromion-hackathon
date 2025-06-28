'use server'

import { cookies } from "next/headers";
import { auth, db } from "../../../firebase/admin";

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;
    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists'
            }
        }
        await db.collection('users').doc(uid).set({
            name, email, role: null
        });

        return {
            success: true,
            message: 'User created successfully. Please select your role.'
        }

    } catch (e) {
        console.error('Error creating a user', e);
        if ((e as { code?: string }).code === 'auth/email-already-exists') {
            return {
                success: false,
                message: 'Email already exists'
            }
        }

        return {
            success: false,
            message: 'Error creating a user'
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: 60 * 60 * 24 * 7 * 1000 });

    cookieStore.set('session', sessionCookie, {
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    })
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;
    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return {
                success: false,
                message: 'User not found. Create an account first.'
            }
        }

        await setSessionCookie(idToken);

        return {
            success: true,
            message: 'User signed in successfully'
        }
    } catch (e: unknown) {
        console.error('Error signing in', e);
        if ((e as { code?: string }).code === 'auth/user-not-found') {
            return {
                success: false,
                message: 'User not found'
            }
        }

        return {
            success: false,
            message: 'Error signing in'
        }
    }
}
