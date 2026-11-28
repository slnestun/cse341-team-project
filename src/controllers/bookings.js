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
	if (
		!trip ||
		(Array.isArray(trip.activeScheduleIds) &&
			!trip.activeScheduleIds.includes(schedule.id))
	) {
		return res.status(404).render("errors/404", {
			title: "Trip Departure Unavailable",
		});
	}
	const ticketClasses = await getAllTicketClasses();
	const ticketOptions = ticketClasses.map((ticketClass) => ({
		class: ticketClass.class,
		name: ticketClass.name,
		price: trip.distance * ticketClass.pricePerKm,
		amenities: ticketClass.amenities,
		description: ticketClass.description,
		availableDays: ticketClass.availableDays,
	}));

	return res.render("trips/book", {
		title: "Book Trip",
		schedule,
		ticketOptions,
	});
};

const processBookingRequest = async (req, res) => {
	const scheduleId = Number(req.body?.scheduleId);

	if (!Number.isInteger(scheduleId)) {
		return res.status(400).send("Invalid schedule.");
	}

	const db = getDb();
	const schedule = await db.collection("schedules").findOne({
		id: scheduleId,
	});

	const trip = schedule
		? await db.collection("trips").findOne({ id: schedule.tripId })
		: null;

	if (
		!trip ||
		(Array.isArray(trip.activeScheduleIds) &&
			!trip.activeScheduleIds.includes(schedule.id))
	) {
		return res
			.status(409)
			.send(
				"This departure is no longer available. Please select another schedule.",
			);
	}
	const bookingData = {
		...req.body,
		id: generateConfirmationCode(),
		createdAt: new Date().toISOString(),
		tripId: trip.id,
		scheduleId: String(schedule.id),
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
