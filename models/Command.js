import mongoose from 'mongoose';

const CommandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this command.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    command: {
        type: String,
        required: [true, 'Please provide the command.'],
    },
    description: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Command || mongoose.model('Command', CommandSchema);
