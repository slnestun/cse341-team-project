import { getDb } from '../db/connect.js';

export async function getSchedulesByTripId(tripId, month) {
    const db = getDb();

    if (month) {
        const monthNum = parseInt(month, 10);

        if (Number.isNaN(monthNum)) {
            return [];
        }

        const trip = await db.collection('trips').findOne({
            $or: [{ id: tripId }, { slug: tripId }]
        });

        const operatingMonths = Array.isArray(trip?.operatingMonths)
            ? trip.operatingMonths.map((m) => Number(m))
            : [];

        if (!operatingMonths.includes(monthNum)) {
            return [];
        }
    }

    return await db.collection('schedules').find({ tripId }).toArray();
}