import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function logAudit({ userId, username, action, serverId = null, serverName = null, ipAddress = null, userAgent = null, details = null }) {
    try {
        await dbConnect();
        await AuditLog.create({
            userId,
            username,
            action,
            serverId,
            serverName,
            ipAddress,
            userAgent,
            details,
        });
    } catch (error) {
        console.error('Audit log error:', error);
    }
}
