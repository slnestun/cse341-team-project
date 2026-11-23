import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: ['customer', 'admin'],
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        }
    },
    {
        timestamps: true,
        collection: 'roles'
    }
);

const Role = mongoose.model('Role', roleSchema);

export default Role;
