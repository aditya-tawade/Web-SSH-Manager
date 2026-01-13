import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import * as OTPAuth from 'otpauth';
import { SignJWT } from 'jose';
import { logAudit } from '@/lib/audit';

import { JWT_SECRET } from '@/lib/auth';

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { username, password, totpToken } = body;

        if (!username || !password) {
            return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
        }

        // Find user
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        if (!user.password) {
            console.error('User password is undefined for:', username);
            return NextResponse.json({ success: false, message: 'Account error - please recreate your account' }, { status: 500 });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        // Check 2FA if enabled
        if (user.totpEnabled) {
            if (!totpToken) {
                return NextResponse.json({
                    success: false,
                    requires2FA: true,
                    message: '2FA token required'
                }, { status: 200 });
            }

            // Check if it's a recovery code (format: XXXX-XXXX)
            const isRecoveryCode = /^[A-F0-9]{4}-[A-F0-9]{4}$/i.test(totpToken);

            if (isRecoveryCode) {
                // Verify recovery code
                const codeIndex = user.recoveryCodes.findIndex(
                    code => code.toUpperCase() === totpToken.toUpperCase()
                );

                if (codeIndex === -1) {
                    return NextResponse.json({ success: false, message: 'Invalid recovery code' }, { status: 401 });
                }

                // Remove used recovery code
                user.recoveryCodes.splice(codeIndex, 1);
                await user.save();
            } else {
                // Verify TOTP token
                const totp = new OTPAuth.TOTP({
                    secret: OTPAuth.Secret.fromBase32(user.totpSecret),
                    algorithm: 'SHA1',
                    digits: 6,
                    period: 30
                });
                const isTokenValid = totp.validate({ token: totpToken, window: 1 }) !== null;
                if (!isTokenValid) {
                    return NextResponse.json({ success: false, message: 'Invalid 2FA token' }, { status: 401 });
                }
            }
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create JWT with user info
        const token = await new SignJWT({
            userId: user._id.toString(),
            username: user.username,
            role: user.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                username: user.username,
                role: user.role
            }
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        // Log successful login
        await logAudit({
            userId: user._id.toString(),
            username: user.username,
            action: 'login',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent'),
            details: user.totpEnabled ? '2FA verified' : 'Password only'
        });

        return response;
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
