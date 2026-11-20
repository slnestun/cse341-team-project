import {
    getSchedulesByTripId as findSchedulesByTripId,
} from '../models/schedules.js';

export async function getSchedulesForTrip(req, res) {
    try {
        const { id } = req.params;

        const schedules = await findSchedulesByTripId(id);

        return res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules for trip:', error);

        return res.status(500).json({
            error: 'Failed to fetch schedules for trip',
        });
    }
}

export async function getSchedulesForTripAndMonth(req, res) {
    try {
        const { id } = req.params;
        const { month } = req.query;

        if (month !== undefined) {
            const monthStr = String(month).trim();
            if (!/^(?:[1-9]|1[0-2])$/.test(monthStr)) {
                return res.status(400).json({
                    error: 'Month must be an integer between 1 and 12',
                });
            }
        }

        const schedules = await findSchedulesByTripId(id, month);

        return res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules for trip and month:', error);

        return res.status(500).json({
            error: 'Failed to fetch schedules for trip and month',
        });
    }
}