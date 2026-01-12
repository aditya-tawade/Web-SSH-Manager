import mongoose from 'mongoose';

const ServerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this server.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    host: {
        type: String,
        required: [true, 'Please provide the server host/IP.'],
    },
    port: {
        type: Number,
        default: 22,
    },
    username: {
        type: String,
        required: [true, 'Please provide the SSH username.'],
    },
    encryptedPrivateKey: {
        type: String,
        required: [true, 'Please provide the private key.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Server || mongoose.model('Server', ServerSchema);
