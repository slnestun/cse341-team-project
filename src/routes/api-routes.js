import { Router } from "express";
import { requireApiLogin } from "../middleware/auth.js";
import { 
        getAllBookings, 
        updateBooking,
        deleteBooking, } 
from "../controllers/bookings.js";
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
  getAllTicketClasses,
  getTicketClassesForDay,
} from "../controllers/ticket-classes.js";

const router = Router();

router.get("/api/trips", getAllTrips);
router.get("/api/trips/:id", getTripById);

router.get("/api/trains", getAllTrains);
router.get("/api/trains/:id", getTrainById);

router.get("/api/trips/:id/schedules", getSchedulesForTripAndMonth);

router.get("/api/bookings", requireApiLogin, getAllBookings);
router.put("/api/bookings/:id", requireApiLogin, updateBooking);
router.delete("/api/bookings/:id", requireApiLogin, deleteBooking);

router.get("/api/ticket-classes", (req, res) => {
  if (Object.hasOwn(req.query, "day")) {
    return getTicketClassesForDay(req, res);
  }

  return getAllTicketClasses(req, res);
});

export default router;
