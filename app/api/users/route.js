import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

import { isAdmin } from '@/lib/auth';

export async function GET(request) {
    // Only admins can list users
    if (!await isAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    try {
        const users = await User.find({}).select('-password -totpSecret -recoveryCodes').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    // Only admins can create users
    if (!await isAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    try {
        const body = await request.json();
        const { username, password, role } = body;

        if (!username || !password) {
            return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: username.toLowerCase(),
            password: hashedPassword,
            role: role || 'operator',
        });

        return NextResponse.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                role: user.role
            }
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
