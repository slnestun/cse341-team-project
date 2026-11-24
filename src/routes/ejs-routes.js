
import { Router } from "express";
import { homePage, aboutPage, testErrorPage } from "./index.js";
import { trainsPage } from "./trains.js";
import { listTripsPage, tripDetailsPage } from "../controllers/trips.js";
import {
    bookingsAdminPage,
    bookingPage,
    processBookingRequest,
    confirmationPage,
} from "../controllers/bookings.js";
import {
    adminDashboardPage,
    login,
    loginPage,
    logout,
    register,
    registerPage,
} from "../controllers/auth.js";
import { usersAdminPage } from "../controllers/users.js";
import {
    requirePageLogin,
    requirePageRole
} from "../middleware/auth.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/trains", trainsPage);

router.get("/trips", listTripsPage);
router.get("/trips/:tripId", tripDetailsPage);

router.get("/register", registerPage);
router.post("/register", register);
router.get("/login", loginPage);
router.post("/login", login);
router.post("/logout", logout);

router.get("/admin", requirePageRole("admin"), adminDashboardPage);

// Protected User Admin page
router.get("/users-admin", requirePageLogin, usersAdminPage);

router.get("/bookings-admin", bookingsAdminPage);
router.get("/trips/booking/:scheduleId", bookingPage);
router.post("/trips/book", processBookingRequest);
router.get("/trips/confirmation/:confirmationId", confirmationPage);

router.get("/500", testErrorPage);

export default router;
