// app/api/logout/route.ts
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = cookies();
    (await cookieStore).set('session', '', {
        maxAge: 0,
        httpOnly: true,
        path: '/',
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
    });
}
