import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Command from '@/models/Command';

export async function GET() {
    await dbConnect();
    try {
        const commands = await Command.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: commands });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { name, command, description } = body;

        if (!name || !command) {
            return NextResponse.json({ success: false, message: 'Name and command are required' }, { status: 400 });
        }

        const cmd = await Command.create({
            name,
            command,
            description: description || '',
        });

        return NextResponse.json({ success: true, data: cmd }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
