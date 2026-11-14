// Alex: A temporary route to fetch trip details and render the details page. This will be replaced by a more robust solution later.

import { getDb } from '../db/connect.js';

export default async (req, res) => {
    try {
        const { tripId } = req.params;
        const db = getDb();

        const details = await db.collection('trips').findOne({ id: tripId });

        if (!details) {
            return res.status(404).render('404', {
                title: 'Trip Not Found'
            });
        }

        return res.render('trips/details', {
            title: 'Trip Details',
            details
        });
    } catch (error) {
        console.error('Error loading trip details:', error);
        return res.status(500).render('500', {
            title: 'Server Error'
        });
    }
};