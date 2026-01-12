import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        const envUsername = process.env.AUTH_USERNAME;
        const envPassword = process.env.AUTH_PASSWORD;

        if (username === envUsername && password === envPassword) {
            const token = jwt.sign(
                { username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const cookie = serialize('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
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

        return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
