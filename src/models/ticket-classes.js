import TicketClass from './schemas/ticket-classes.js';

const getAllTicketClasses = async () =>
    TicketClass.find({}).sort({ pricePerKm: 1 }).lean();

const getTicketClassesForDay = async (day) =>
    TicketClass.find({ availableDays: day }).sort({ pricePerKm: 1 }).lean();

export { getAllTicketClasses, getTicketClassesForDay };
