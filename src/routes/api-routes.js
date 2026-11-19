
import { Router } from 'express';
import {
    getAllTrips,
    getTripById
} from '../controllers/trips.js';
import {
    getAllTrains,
    getTrainById
} from '../controllers/trains.js';
import {
    getAllTicketClasses,
    getTicketClassesForDay
} from '../controllers/ticket-classes.js';

const router = Router();

// Trips API
router.get('/api/trips', getAllTrips);
router.get('/api/trips/:id', getTripById);

// Trains API
router.get('/api/trains', getAllTrains);
router.get('/api/trains/:id', getTrainById);

// Ticket Classes API
router.get('/api/ticket-classes', (req, res) => {
    if (Object.hasOwn(req.query, 'day')) {
        return getTicketClassesForDay(req, res);
    }

    return getAllTicketClasses(req, res);
});
export default router;
