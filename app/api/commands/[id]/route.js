import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Command from '@/models/Command';

export async function DELETE(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const deletedCommand = await Command.findByIdAndDelete(id);
        if (!deletedCommand) {
            return NextResponse.json({ success: false, message: 'Command not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Command deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function PUT(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const body = await request.json();

        const updatedCommand = await Command.findByIdAndUpdate(id, body, { new: true });
        if (!updatedCommand) {
            return NextResponse.json({ success: false, message: 'Command not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedCommand });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
