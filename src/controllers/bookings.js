//src/controllers/bookings.js
import { getDb } from "../db/connect.js";
import { generateConfirmationCode } from "../includes/helpers.js";
import {
	getAllBookings as findAllBookings,
	getBookingsByPassengerEmail,
	createBooking,
	getBookingById,
	updateBookingById,
	deleteBookingById,
} from "../models/bookings.js";

import { getAllTicketClasses } from "../models/ticket-classes.js";

//validator
const isAdmin = (user) => user?.role === "admin";

const canAccessBooking = (user, booking) => {
	if (!user) return false;
	if (isAdmin(user)) return true;

	const userEmail = String(user.email || "").trim().toLowerCase();
	if (!userEmail) return false;

	return (booking.passengers || []).some(
		(passenger) =>
			String(passenger.email || "").trim().toLowerCase() === userEmail,
	);
};


export async function getAllBookings(req, res) {
	try {
		const bookings = isAdmin(req.user)
			? await findAllBookings()
			: await getBookingsByPassengerEmail(req.user?.email);

		return res.status(200).json({ bookings });
	} 
	catch (error) {
		console.error("Error fetching bookings:", error);

		return res.status(500).json({
			error: "Unable to load bookings.",
		});
	}
}
export async function updateBooking(req, res) {
	try {
		const { id } = req.params;
		const existingBooking = await getBookingById(id);

		if (!existingBooking) {
			return res.status(404).json({ error: "Booking not found." });
		}

		if (!canAccessBooking(req.user, existingBooking)) {
			return res
				.status(403)
				.json({ error: "You do not have permission to update this booking." });
		}

		const { ticketClass, selectedDay, passengers } = req.body;
		const updateData = {};

		if (ticketClass !== undefined) {
			if (typeof ticketClass !== "string" || !ticketClass.trim()) {
				return res.status(400).json({ error: "Invalid ticketClass." });
			}
			updateData.ticketClass = ticketClass.trim();
		}

		if (selectedDay !== undefined) {
			if (typeof selectedDay !== "string" || !selectedDay.trim()) {
				return res.status(400).json({ error: "Invalid selectedDay." });
			}
			updateData.selectedDay = selectedDay.trim();
		}

		if (passengers !== undefined) {
			if (!Array.isArray(passengers) || passengers.length === 0) {
				return res
					.status(400)
					.json({ error: "Passengers must be a non-empty array." });
			}

			const hasInvalidPassenger = passengers.some(
				(p) =>
					!p ||
					typeof p.firstName !== "string" ||
					!p.firstName.trim() ||
					typeof p.lastName !== "string" ||
					!p.lastName.trim() ||
					typeof p.email !== "string" ||
					!p.email.trim() ||
					typeof p.phone !== "string" ||
					!p.phone.trim(),
			);

			if (hasInvalidPassenger) {
				return res.status(400).json({
					error:
						"Each passenger requires firstName, lastName, email, and phone.",
				});
			}

			updateData.passengers = passengers.map((p) => ({
				firstName: p.firstName.trim(),
				lastName: p.lastName.trim(),
				email: p.email.trim().toLowerCase(),
				phone: p.phone.trim(),
			}));
		}

		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({
				error:
					"Provide at least one field to update (ticketClass, selectedDay, or passengers).",
			});
		}

		const updatedBooking = await updateBookingById(id, updateData);
		return res.status(200).json({ booking: updatedBooking });
	} catch (error) {
		console.error("Error updating booking:", error);
		return res.status(500).json({ error: "Unable to update booking." });
	}
}

export async function deleteBooking(req, res) {
	try {
		const { id } = req.params;
		const existingBooking = await getBookingById(id);

		if (!existingBooking) {
			return res.status(404).json({ error: "Booking not found." });
		}

		if (!canAccessBooking(req.user, existingBooking)) {
			return res
				.status(403)
				.json({ error: "You do not have permission to delete this booking." });
		}

		await deleteBookingById(id);
		return res.status(200).json({
			message: "Booking deleted successfully.",
			id,
		});
	} catch (error) {
		console.error("Error deleting booking:", error);
		return res.status(500).json({ error: "Unable to delete booking." });
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
