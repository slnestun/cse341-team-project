//src/models/bookings.js.
import booking from "./schemas/bookings.js";

export async function getBookingById(id) {
	return booking.findOne({ id }).lean();
}

export async function getAllBookings() {
	return booking.find({}).lean();
}

export async function getBookingByPassengerEmail(email){
	const normalizedEmail = String(email || "").trim().toLowerCase();
	if(!normalizedEmail) {
		return [];
	}
	return booking
		.find({ "passengers.email": normalizedEmail })
		.lean()
		.collation({ locale: "en", strength: 2 });
}

export const createBooking = async (bookingData) => {
	const newBooking = await booking.create(bookingData);
	return newBooking;
};

export async function updateBookingById(id, updateData) {
	return booking
		.findOneAndUpdate(
			{ id },
			{ $set: updateData },
			{ new: true, runValidators: true },
		)
		.lean();
}

export async function deleteBookingById(id) {
	return booking.findOneAndDelete({ id }).lean();
}