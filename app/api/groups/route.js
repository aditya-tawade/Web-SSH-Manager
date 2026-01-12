import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';

export async function GET() {
    await dbConnect();
    try {
        const groups = await Group.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: groups });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { name, color, icon } = body;

        if (!name) {
            return NextResponse.json({ success: false, message: 'Group name is required' }, { status: 400 });
        }

        const group = await Group.create({
            name,
            color: color || '#3b82f6',
            icon: icon || 'folder',
        });

        return NextResponse.json({ success: true, data: group }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
