
import {
    getAllTrips as findAllTrips,
    getTripById as findTripById
} from '../models/trips.js';
import { getDb } from '../db/connect.js';

// GET /api/trips
const getAllTrips = async (req, res) => {
    try {
        const trips = await findAllTrips();
        return res.status(200).json({ trips });
    } catch (error) {
        console.error('Error retrieving trips:', error);
        return res.status(500).json({
            message: 'Unable to retrieve trips.'
        });
    }
};

// GET /api/trips/:id
const getTripById = async (req, res) => {
    try {
        const trip = await findTripById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found.'
            });
        }

        return res.status(200).json(trip);
    } catch (error) {
        console.error('Error retrieving trip:', error);
        return res.status(500).json({
            message: 'Unable to retrieve trip.'
        });
    }
};

// Render the Trips list page
const listTripsPage = (req, res) => {
    return res.render('trips/list', {
        title: 'Scenic Train Trips'
    });
};

// Render an individual Trip details page
const tripDetailsPage = async (req, res) => {
    try {
        const { tripId } = req.params;
        const details = await findTripById(tripId);

        if (!details) {
            return res.status(404).render('errors/404', {
                title: 'Trip Not Found'
            });
        }

        details.schedules = await getDb()
            .collection('schedules')
            .find({ tripId })
            .toArray();

        return res.render('trips/details', {
            title: 'Trip Details',
            details
        });
    } catch (error) {
        console.error('Error rendering trip details:', error);
        return res.status(500).send('Unable to load trip details.');
    }
};

export {
    getAllTrips,
    getTripById,
    listTripsPage,
    tripDetailsPage
};
