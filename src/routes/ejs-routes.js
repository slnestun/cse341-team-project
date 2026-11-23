
import { Router } from 'express';
import {
    homePage,
    aboutPage,
    testErrorPage
} from './index.js';
import { trainsPage } from './trains.js';
import {
    listTripsPage,
    tripDetailsPage
} from '../controllers/trips.js';
import {
    bookingPage,
    processBookingRequest
} from './book.js';
import confirmationPage from './confirm.js';
import {
    adminDashboardPage,
    login,
    loginPage,
    logout,
    register,
    registerPage
} from '../controllers/auth.js';
import { requirePageRole } from '../middleware/auth.js';

const router = Router();

// Home and information pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Authentication pages
router.get('/register', registerPage);
router.post('/register', register);
router.get('/login', loginPage);
router.post('/login', login);
router.post('/logout', logout);
router.get('/admin', requirePageRole('admin'), adminDashboardPage);

// Trains page
router.get('/trains', trainsPage);

// Trips pages
router.get('/trips', listTripsPage);
router.get('/trips/:tripId', tripDetailsPage);

// Booking pages
router.get('/trips/booking/:scheduleId', bookingPage);
router.post('/trips/book', processBookingRequest);
router.get('/trips/confirmation/:confirmationId', confirmationPage);

// Test error page
router.get('/500', testErrorPage);

export default router;
