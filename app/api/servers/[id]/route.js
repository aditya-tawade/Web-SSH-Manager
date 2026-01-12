import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Server from '@/models/Server';

export async function DELETE(request, context) {
    await dbConnect();
    try {
        const { id } = await context.params;
        const deletedServer = await Server.findByIdAndDelete(id);
        if (!deletedServer) {
            return NextResponse.json({ success: false, message: 'Server not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Server deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
