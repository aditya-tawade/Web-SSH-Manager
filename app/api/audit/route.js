import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 100;
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');

        const query = {};
        if (action) query.action = action;
        if (userId) query.userId = userId;

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('userId', 'username')
            .populate('serverId', 'name host');

        return NextResponse.json({ success: true, data: logs });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
