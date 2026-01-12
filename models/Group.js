import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this group.'],
        maxlength: [40, 'Name cannot be more than 40 characters'],
    },
    color: {
        type: String,
        default: '#3b82f6', // blue-500
    },
    icon: {
        type: String,
        default: 'folder',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Group || mongoose.model('Group', GroupSchema);
