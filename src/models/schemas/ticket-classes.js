import mongoose from 'mongoose';

const weekdays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

const ticketClassSchema = new mongoose.Schema(
    {
        class: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        pricePerKm: {
            type: Number,
            required: true,
            min: 0
        },
        amenities: {
            type: [String],
            default: []
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        availableDays: {
            type: [
                {
                    type: String,
                    enum: weekdays,
                    lowercase: true,
                    trim: true
                }
            ],
            required: true,
            validate: {
                validator: (days) => days.length > 0,
                message: 'At least one available day is required.'
            }
        }
    },
    {
        collection: 'ticketClasses'
    }
);

const TicketClass = mongoose.model('TicketClass', ticketClassSchema);

export { weekdays };
export default TicketClass;
