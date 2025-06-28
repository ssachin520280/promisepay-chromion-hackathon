// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './firebase/admin';

const PROTECTED_PATHS = ['/dashboard', '/dashboard/client', '/dashboard/freelancer'];


export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    console.log("Middleware hit:", request.nextUrl.pathname);
    console.log("Session cookie:", session);
    console.log("Request URL:", request.url);
    if (!session && PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    try {
        await auth.verifySessionCookie(session!, true); // throws if invalid or expired
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }
}

export const config = {
    matcher: ['/dashboard/:path*'],
};


