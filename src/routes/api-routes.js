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

const router = Router();

router.get("/api/trips", getAllTrips);
router.get("/api/trips/:id", getTripById);

router.get("/api/trains", getAllTrains);
router.get("/api/trains/:id", getTrainById);

router.get("/api/trips/:id/schedules", getSchedulesForTripAndMonth);

router.get("/api/bookings", getAllBookings);

export default router;