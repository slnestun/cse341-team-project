import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    tripId: {
        type: String, // Changed from ObjectId to String to match string slugs like 'alpine-panorama'
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    },
    months: {
        type: [Number],
        required: true
    },
    daysOfWeek: {
        type: [String],
        required: true
    }
});

export default scheduleSchema;