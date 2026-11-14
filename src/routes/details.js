// Alex: A temporary route to fetch trip details and render the details page. This will be replaced by a more robust solution later.

import { getDb } from '../db/connect.js';

export default async (req, res) => {
    try {
        const { tripId } = req.params;
        const db = getDb();

        // Fetch trip directly from DB without needing the teammate's model file yet
        const details = await db.collection('trips').findOne({ id: tripId });

        if (!details) {
            return res.status(404).render('404', {
                title: 'Trip Not Found'
            });
        }

        // Schedules are now handled dynamically on the client-side via your new API!
        res.render('trips/details', {
            title: 'Trip Details',
            details
        });
    } catch (error) {
        console.error('Error loading trip details:', error);
        res.status(500).render('500', {
            title: 'Server Error'
        });
    }
};
