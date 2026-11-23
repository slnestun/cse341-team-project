//src/controllers/bookins.js
import { getDb } from "../db/connect.js";
import { generateConfirmationCode } from "../includes/helpers.js";
import {
	getAllBookings as findAllBookings,
	createBooking,
	getBookingById,
} from "../models/bookings.js";
import { getAllTicketClasses } from "../models/ticket-classes.js";

export async function getAllBookings(req, res) {
	try {
		const bookings = await findAllBookings();

		return res.status(200).json({ bookings });
	} catch (error) {
		console.error("Error fetching bookings:", error);

		return res.status(500).json({
			error: "Unable to load bookings.",
		});
	}
}

const bookingPage = async (req, res) => {
	const { scheduleId } = req.params;

	const db = getDb();
	const schedule = await db
		.collection("schedules")
		.findOne({ id: Number(scheduleId) });
	if (!schedule) {
		const error = new Error("Schedule not found");
		error.status = 404;
		throw error;
	}
	const trip = await db.collection("trips").findOne({ id: schedule.tripId });
	const ticketClasses = await getAllTicketClasses();
	const ticketOptions = ticketClasses.map((ticketClass) => ({
		class: ticketClass.class,
		name: ticketClass.name,
		price: trip.distance * ticketClass.pricePerKm,
		amenities: ticketClass.amenities,
		description: ticketClass.description,
		availableDays: ticketClass.availableDays,
	}));

	res.render("trips/book", {
		title: "Book Trip",
		schedule,
		ticketOptions,
	});
};

const processBookingRequest = async (req, res) => {
	const bookingData = {
		...req.body,
		id: generateConfirmationCode(),
		createdAt: new Date().toISOString(),
	};

	const booking = await createBooking(bookingData);

	return res.redirect(`/trips/confirmation/${booking.id}`);
};

export const confirmationPage = async (req, res) => {
	const { confirmationId } = req.params;
	const confirmation = await getBookingById(confirmationId);

	if (!confirmation) {
		return res.status(404).render("errors/404", {
			title: "Booking Not Found",
		});
	}

	return res.render("trips/confirm", {
		title: "Trip Confirmation",
		confirmation,
	});
};

export const bookingsAdminPage = (req, res) => {
	return res.render("bookings", {
		title: "Bookings Admin",
	});
};

export { bookingPage, processBookingRequest };
