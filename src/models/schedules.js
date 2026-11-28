import { getDb } from "../db/connect.js";

export async function getSchedulesByTripId(tripId, month) {
	const db = getDb();

	const trip = await db.collection("trips").findOne({
		$or: [{ id: tripId }, { slug: tripId }],
	});

	if (!trip) {
		return [];
	}

	if (month !== undefined) {
		const monthNum = Number(String(month).trim());

		if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
			return [];
		}

		const operatingMonths = (trip.operatingMonths || []).map(Number);

		if (!operatingMonths.includes(monthNum)) {
			return [];
		}
	}

	const filter = { tripId: trip.id };

	if (Array.isArray(trip.activeScheduleIds)) {
		filter.id = { $in: trip.activeScheduleIds };
	}

	return db.collection("schedules").find(filter).toArray();
}
