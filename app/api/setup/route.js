import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    await dbConnect();
    try {
        const userCount = await User.countDocuments();
        return NextResponse.json({ success: true, setupRequired: userCount === 0 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        // Check if any users already exist
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return NextResponse.json({ success: false, message: 'Setup already completed' }, { status: 400 });
        }

        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const user = await User.create({
            username: username.toLowerCase(),
            password: hashedPassword,
            role: 'admin',
        });

        return NextResponse.json({
            success: true,
            message: 'Admin account created successfully',
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
