import Schedule from './schemas/schedules.js';

/**
 * Get schedules for a specific trip, with an optional month filter.
 * @param {string} tripId - The ID of the trip
 * @param {number} [month] - Optional month number
 */
export async function getSchedulesByTripId(tripId, month) {
    const query = { tripId };
    if (month) {
        query.month = Number(month);
    }
    return Schedule.find(query).lean();
}