import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function POST(request) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        // Get user info from headers (set by middleware)
        const userId = request.headers.get('x-user-id');
        const username = request.headers.get('x-username');

        if (userId && username) {
            await logAudit({
                userId,
                username,
                action: 'logout',
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent'),
            });
        }

        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
        response.cookies.delete('auth-token');

        return response;
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
