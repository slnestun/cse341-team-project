//src/models/bookings.js.
import booking from "./schemas/bookings.js";

export async function getBookingById(id) {
	return booking.findOne({ id }).lean();
}

export async function getAllBookings() {
	return booking.find({}).lean();
}

export const createBooking = async (bookingData) => {
	const newBooking = await booking.create(bookingData);
	return newBooking;
};
