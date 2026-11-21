import { Router } from "express";
import {
	bookingsAdminPage,
	bookingPage,
	processBookingRequest,
	confirmationPage,
} from "../controllers/bookings.js";

const router = Router();

router.get("/bookings-admin", bookingsAdminPage);
router.get("/trips/booking/:scheduleId", bookingPage);
router.post("/trips/book", processBookingRequest);
router.get("/trips/confirmation/:confirmationId", confirmationPage);

export default router;
