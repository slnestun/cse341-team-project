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
    adminDashboardPage,
    login,
    loginPage,
    logout,
    register,
    registerPage,
    userDashboardPage
} from '../controllers/auth.js';
import { requirePageLogin, requirePageRole } from '../middleware/auth.js';

const router = Router();

// EJS routes
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/trains', trainsPage);

// Trip-related routes
router.get('/trips', listTripsPage);
router.get('/trips/:tripId', tripDetailsPage);

// Authentication routes
router.get('/register', registerPage);
router.post('/register', register);
router.get('/login', loginPage);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', requirePageLogin, userDashboardPage);
router.get('/admin', requirePageRole('admin'), adminDashboardPage);

// Error testing route
router.get('/500', testErrorPage);

export default router;