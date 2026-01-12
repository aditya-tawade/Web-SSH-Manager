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
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
