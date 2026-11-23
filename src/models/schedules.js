import { getDb } from '../db/connect.js';

export async function getSchedulesByTripId(tripId, month) {
    const db = getDb();

    if (month !== undefined) {
        const monthNum = Number(String(month).trim());

        if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
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