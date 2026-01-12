import { NextResponse } from 'next/server';
import { getPayload } from '@/lib/auth';

export async function GET(request) {
    try {
        const payload = await getPayload(request);

        if (!payload) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

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
