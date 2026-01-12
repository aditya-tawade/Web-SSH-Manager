import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);

        return NextResponse.json({
            success: true,
            user: {
                userId: payload.userId,
                username: payload.username,
                role: payload.role,
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
}
