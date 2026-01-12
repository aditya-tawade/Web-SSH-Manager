import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'operator', 'viewer'],
        default: 'operator',
    },
    totpSecret: {
        type: String,
        default: null,
    },
    totpEnabled: {
        type: Boolean,
        default: false,
    },
    recoveryCodes: {
        type: [String],
        default: [],
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    allowedServers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
    }],
}, { timestamps: true });

UserSchema.pre('save', function (next) {
    if (!this.allowedServers) this.allowedServers = [];
    next();
});

// Force delete model in development to ensure schema updates are applied
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
