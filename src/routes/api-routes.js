import { Router } from "express";
import { getAllBookings } from "../controllers/bookings.js";
import { getSchedulesForTripAndMonth } from "../controllers/schedules.js";
import {
	getAllTrips,
	getTripById,
	updateTrip,
	deleteTrip,
	getTripScheduleOptions,
} from "../controllers/trips.js";
import { getAllTrains, getTrainById } from "../controllers/trains.js";
import { getAllStations, getStationById } from "../controllers/stations.js";
import {
	getAllTicketClasses,
	getTicketClassesForDay,
} from "../controllers/ticket-classes.js";
import { requireApiRole } from "../middleware/auth.js";

const router = Router();

router.get("/api/trips", getAllTrips);
router.get("/api/trips/:id", getTripById);
router.put("/api/trips/:id", requireApiRole("admin"), updateTrip);
router.delete("/api/trips/:id", requireApiRole("admin"), deleteTrip);
router.get(
	"/api/admin/trips/:id/schedules",
	requireApiRole("admin"),
	getTripScheduleOptions,
);

router.get("/api/trains", getAllTrains);
router.get("/api/trains/:id", getTrainById);

router.get("/api/trips/:id/schedules", getSchedulesForTripAndMonth);

router.get("/api/bookings", getAllBookings);

router.get("/api/ticket-classes", (req, res) => {
	if (Object.hasOwn(req.query, "day")) {
		return getTicketClassesForDay(req, res);
	}

	return getAllTicketClasses(req, res);
});

// Stations API
router.get("/api/stations", getAllStations);
router.get("/api/stations/:id", getStationById);

export default router;
