import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
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
    dayOfWeek: {
        type: String,
        required: true
    },
    month: {
        type: Number,
        required: false
    }
});

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

export default Schedule;