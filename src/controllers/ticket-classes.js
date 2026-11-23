import {
    getAllTicketClasses as findAllTicketClasses,
    getTicketClassesForDay as findTicketClassesForDay
} from '../models/ticket-classes.js';
import { weekdays } from '../models/schemas/ticket-classes.js';

const getAllTicketClasses = async (req, res) => {
    try {
        const ticketClasses = await findAllTicketClasses();

        return res.status(200).json({ ticketClasses });
    } catch (error) {
        console.error('Error retrieving ticket classes:', error);
        return res.status(500).json({
            error: 'Unable to retrieve ticket classes.'
        });
    }
};

const getTicketClassesForDay = async (req, res) => {
    const { day } = req.query;

    if (typeof day !== 'string' || !weekdays.includes(day.trim().toLowerCase())) {
        return res.status(400).json({
            error: 'Invalid day. Use a weekday from monday through sunday.'
        });
    }

    const normalizedDay = day.trim().toLowerCase();

    try {
        const ticketClasses = await findTicketClassesForDay(normalizedDay);

        return res.status(200).json({ ticketClasses });
    } catch (error) {
        console.error('Error retrieving ticket classes by day:', error);
        return res.status(500).json({
            error: 'Unable to retrieve ticket classes.'
        });
    }
};

export { getAllTicketClasses, getTicketClassesForDay };
