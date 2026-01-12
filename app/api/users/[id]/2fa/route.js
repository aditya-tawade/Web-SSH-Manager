import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Generate 10 random recovery codes
function generateRecoveryCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
}

export async function POST(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Generate new TOTP secret
        const secret = new OTPAuth.Secret({ size: 20 });

        // Create TOTP instance
        const totp = new OTPAuth.TOTP({
            issuer: 'UnifiedSSH',
            label: user.username,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: secret
        });

        // Generate QR code
        const qrCode = await QRCode.toDataURL(totp.toString());

        // Generate recovery codes
        const recoveryCodes = generateRecoveryCodes();

        // Save secret and recovery codes (base32 encoded) temporarily
        user.totpSecret = secret.base32;
        user.recoveryCodes = recoveryCodes;
        await user.save();

        return NextResponse.json({
            success: true,
            data: {
                secret: secret.base32,
                qrCode,
                recoveryCodes,
                message: 'Scan the QR code and verify with a token to enable 2FA. Save your recovery codes!'
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function PUT(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { token } = body;

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        if (!user.totpSecret) {
            return NextResponse.json({ success: false, message: 'TOTP not set up' }, { status: 400 });
        }

        // Verify token
        const totp = new OTPAuth.TOTP({
            secret: OTPAuth.Secret.fromBase32(user.totpSecret),
            algorithm: 'SHA1',
            digits: 6,
            period: 30
        });
        const isValid = totp.validate({ token, window: 1 }) !== null;

        if (!isValid) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 400 });
        }

        // Enable 2FA
        user.totpEnabled = true;
        await user.save();

        return NextResponse.json({ success: true, message: '2FA enabled successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function DELETE(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        user.totpSecret = null;
        user.totpEnabled = false;
        user.recoveryCodes = [];
        await user.save();

        return NextResponse.json({ success: true, message: '2FA disabled successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
