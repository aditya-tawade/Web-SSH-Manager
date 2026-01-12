import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

import { isAdmin } from '@/lib/auth';

export async function DELETE(request, context) {
    // Only admins can delete users
    if (!await isAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    try {
        const { id } = await context.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function PUT(request, context) {
    // Only admins can update users
    if (!await isAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { role, password, allowedServers } = body;

        const updateData = {};
        if (role) updateData.role = role;
        if (allowedServers) updateData.allowedServers = allowedServers;
        if (password) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password -totpSecret -recoveryCodes');
        if (!updatedUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
