import {
	getAllTrips as findAllTrips,
	getTripById as findTripById,
} from "../models/trips.js";
import { getDb } from "../db/connect.js";
import { updateTrip as saveTripChanges } from "../models/trips.js";
import { deleteTrip as removeTrip } from "../models/trips.js";

// GET /api/trips
const getAllTrips = async (req, res) => {
	try {
		const trips = await findAllTrips();
		return res.status(200).json({ trips });
	} catch (error) {
		console.error("Error retrieving trips:", error);
		return res.status(500).json({
			message: "Unable to retrieve trips.",
		});
	}
};

// GET /api/trips/:id
const getTripById = async (req, res) => {
	try {
		const trip = await findTripById(req.params.id);

		if (!trip) {
			return res.status(404).json({
				message: "Trip not found.",
			});
		}

		return res.status(200).json(trip);
	} catch (error) {
		console.error("Error retrieving trip:", error);
		return res.status(500).json({
			message: "Unable to retrieve trip.",
		});
	}
};

// Render the Trips list page
const listTripsPage = (req, res) => {
	return res.render("trips/list", {
		title: "Scenic Train Trips",
	});
};

// Render an individual Trip details page
const tripDetailsPage = async (req, res) => {
	try {
		const { tripId } = req.params;
		const details = await findTripById(tripId);

		if (!details) {
			return res.status(404).render("errors/404", {
				title: "Trip Not Found",
			});
		}

		details.schedules = await getDb()
			.collection("schedules")
			.find({ tripId })
			.toArray();

		return res.render("trips/details", {
			title: "Trip Details",
			details,
		});
	} catch (error) {
		console.error("Error rendering trip details:", error);
		return res.status(500).send("Unable to load trip details.");
	}
};

export async function updateTrip(req, res) {
	const { name, description, startStation, endStation, activeScheduleIds } =
		req.body ?? {};

	const fields = [name, description, startStation, endStation];

	if (fields.some((value) => typeof value !== "string" || !value.trim())) {
		return res.status(400).json({
			message: "Name, description, and both stations are required.",
		});
	}

	const start = startStation.trim();
	const end = endStation.trim();

	if (start === end) {
		return res.status(400).json({
			message: "Start and end stations must be different.",
		});
	}
	if (
		!Array.isArray(activeScheduleIds) ||
		activeScheduleIds.some((id) => !Number.isInteger(id))
	) {
		return res.status(400).json({
			message: "Schedule IDs must be an array of integers.",
		});
	}

	const selectedIds = [...new Set(activeScheduleIds)];
	try {
		const stationCount = await getDb()
			.collection("stations")
			.countDocuments({ id: { $in: [start, end] } });

		if (stationCount !== 2) {
			return res.status(400).json({
				message: "Select existing stations.",
			});
		}
		const scheduleCount = await getDb()
			.collection("schedules")
			.countDocuments({
				tripId: req.params.id,
				id: { $in: selectedIds },
			});

		if (scheduleCount !== selectedIds.length) {
			return res.status(400).json({
				message: "Select existing schedules belonging to this trip.",
			});
		}
		const updatedTrip = await saveTripChanges(req.params.id, {
			name: name.trim(),
			description: description.trim(),
			startStation: start,
			endStation: end,
			activeScheduleIds: selectedIds,
		});

		if (!updatedTrip) {
			return res.status(404).json({
				message: "Trip not found.",
			});
		}

		return res.status(200).json(updatedTrip);
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).json({
				message: "Invalid trip details.",
			});
		}

		console.error("Error updating trip:", error);

		return res.status(500).json({
			message: "Unable to update trip.",
		});
	}
}

export async function deleteTrip(req, res) {
	try {
		const deletedTrip = await removeTrip(req.params.id);

		if (!deletedTrip) {
			return res.status(404).json({
				message: "Trip not found.",
			});
		}

		return res.status(204).end();
	} catch (error) {
		console.error("Error deleting trip:", error);

		return res.status(500).json({
			message: "Unable to delete trip.",
		});
	}
}

export async function getTripScheduleOptions(req, res) {
	try {
		const trip = await findTripById(req.params.id);

		if (!trip) {
			return res.status(404).json({
				message: "Trip not found.",
			});
		}

		const schedules = await getDb()
			.collection("schedules")
			.find({ tripId: req.params.id })
			.sort({ departureTime: 1 })
			.toArray();

		return res.status(200).json({ schedules });
	} catch (error) {
		console.error("Error loading schedule options:", error);

		return res.status(500).json({
			message: "Unable to load schedule options.",
		});
	}
}

export { getAllTrips, getTripById, listTripsPage, tripDetailsPage };
