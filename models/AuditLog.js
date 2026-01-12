import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        enum: ['login', 'logout', 'ssh_connect', 'ssh_disconnect', 'sftp_access', 'server_create', 'server_delete'],
        required: true,
    },
    serverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        default: null,
    },
    serverName: {
        type: String,
        default: null,
    },
    ipAddress: {
        type: String,
        default: null,
    },
    userAgent: {
        type: String,
        default: null,
    },
    details: {
        type: String,
        default: null,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
