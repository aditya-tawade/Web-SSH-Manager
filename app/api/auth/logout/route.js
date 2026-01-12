import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
    const cookie = serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1,
        path: '/',
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            'Set-Cookie': cookie,
            'Content-Type': 'application/json',
        },
    });
}
