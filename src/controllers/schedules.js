import {
    getSchedulesByTripId as findSchedulesByTripId,
} from "../models/schedules.js";

export async function getSchedulesForTrip(req, res) {
    try {
        const { id } = req.params;

        const schedules = await findSchedulesByTripId(id);

        return res.status(200).json(schedules);
    } catch (error) {
        console.error("Error fetching schedules for trip:", error);

        return res.status(500).json({
            error: "Failed to fetch schedules for trip",
        });
    }
}

export async function getSchedulesForTripAndMonth(req, res) {
    try {
        const { id } = req.params;
        const { month } = req.query;

        const schedules = await findSchedulesByTripId(id, month);

        return res.status(200).json(schedules);
    } catch (error) {
        console.error("Error fetching schedules for trip and month:", error);

        return res.status(500).json({
            error: "Failed to fetch schedules for trip and month",
        });
    }
}