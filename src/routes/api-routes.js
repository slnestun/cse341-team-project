
import { Router } from "express";
import { getAllBookings } from "../controllers/bookings.js";
import { getSchedulesForTripAndMonth } from "../controllers/schedules.js";
import {
	getAllTrips,
	getTripById,
} from "../controllers/trips.js";
import {
	getAllTrains,
	getTrainById,
} from "../controllers/trains.js";
import {
	getAllStations,
	getStationById,
} from "../controllers/stations.js";
import {
	getAllTicketClasses,
	getTicketClassesForDay,
} from "../controllers/ticket-classes.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.js";
import { requireApiLogin } from "../middleware/auth.js";

const router = Router();

// User management routes
router.get("/api/users", requireApiLogin, getAllUsers);
router.get("/api/users/:id", requireApiLogin, getUserById);
router.put("/api/users/:id", requireApiLogin, updateUser);
router.delete("/api/users/:id", requireApiLogin, deleteUser);

// Trip routes
router.get("/api/trips", getAllTrips);
router.get("/api/trips/:id", getTripById);

// Train routes
router.get("/api/trains", getAllTrains);
router.get("/api/trains/:id", getTrainById);

// Schedule routes
router.get("/api/trips/:id/schedules", getSchedulesForTripAndMonth);

// Booking routes
router.get("/api/bookings", getAllBookings);

// Ticket class routes
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