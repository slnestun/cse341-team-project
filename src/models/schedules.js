import { getDb } from '../db/connect.js';

export async function getSchedulesByTripId(tripId, month) {
    const db = getDb();
    const query = { tripId };

    if (month) {
        const monthNum = parseInt(month, 10);
        const monthStr = month.toString();

        // Check multiple possible field names and handle both number & string types
        query.$or = [
            { months: monthNum },
            { months: monthStr },
            { month: monthNum },
            { month: monthStr }
        ];
    }

    return await db.collection('schedules').find(query).toArray();
}