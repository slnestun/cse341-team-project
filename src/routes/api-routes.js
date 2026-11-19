import { getSchedulesForTripAndMonth } from '../controllers/schedules.js';
import { Router } from 'express';
import {
    getAllTrips,
    getTripById
} from '../controllers/trips.js';
import {
    getAllTrains,
    getTrainById
} from '../controllers/trains.js';

const router = Router();

// Trips API
router.get('/api/trips', getAllTrips);
router.get('/api/trips/:id', getTripById);

// Trains API
router.get('/api/trains', getAllTrains);
router.get('/api/trains/:id', getTrainById);

// Schedules API
router.get('/api/trips/:id/schedules', getSchedulesForTripAndMonth);

export default router;
