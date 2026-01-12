import { NextResponse } from 'next/server';
import { getPayload } from './lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Paths that don't require authentication
    if (
        pathname === '/login' ||
        pathname === '/setup' ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/setup') ||
        pathname.startsWith('/_next') ||
        pathname.includes('favicon.ico')
    ) {
        return NextResponse.next();
    }

    // Check if setup is needed (no users exist)
    // We'll do this check only for the root path to avoid too many DB calls
    if (pathname === '/') {
        try {
            const setupCheck = await fetch(new URL('/api/setup', request.url));
            const setupData = await setupCheck.json();
            if (setupData.setupRequired) {
                return NextResponse.redirect(new URL('/setup', request.url));
            }
        } catch (e) {
            // Continue if check fails
        }
    }

    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const payload = await getPayload(request);

        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Add user info to headers for API routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId || payload.sub);
        requestHeaders.set('x-user-role', payload.role);
        requestHeaders.set('x-username', payload.username);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (err) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!api/auth|api/setup|_next/static|_next/image|favicon.ico).*)'],
};
