import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import Server from '@/models/Server';

export async function DELETE(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;

        // Remove group reference from servers
        await Server.updateMany({ group: id }, { group: null });

        const deletedGroup = await Group.findByIdAndDelete(id);
        if (!deletedGroup) {
            return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function PUT(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const body = await request.json();

        const updatedGroup = await Group.findByIdAndUpdate(id, body, { new: true });
        if (!updatedGroup) {
            return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedGroup });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
