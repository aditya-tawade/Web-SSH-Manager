import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

export const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret'
);

export async function getPayload(request) {
    // 1. Try to get from headers (set by middleware)
    const headerUserId = request.headers.get('x-user-id');
    const headerRole = request.headers.get('x-user-role');
    const headerUsername = request.headers.get('x-username');

    if (headerUserId && headerRole) {
        return { userId: headerUserId, role: headerRole, username: headerUsername };
    }

    // 2. Fallback: Verify JWT from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        // Normalize payload
        return {
            userId: payload.userId || payload.sub,
            role: payload.role || 'operator',
            username: payload.username
        };
    } catch (err) {
        return null;
    }
}

export async function isAdmin(request) {
    const payload = await getPayload(request);
    return payload?.role === 'admin';
}

export async function getUserId(request) {
    const payload = await getPayload(request);
    return payload?.userId;
}
