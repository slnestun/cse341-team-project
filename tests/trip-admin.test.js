import { expect, test } from "vitest";
import request from "supertest";
import app from "../app.js";
import Trip from "../src/models/schemas/trips.js";

test("signed-out visitors are redirected to login", async () => {
	const response = await request(app).get("/trips-admin");

	expect(response.status).toBe(302);
	expect(response.headers.location).toBe("/login");
});

test.each(["put", "delete"])(
	"signed-out users cannot %s trips",
	async (method) => {
		const response = await request(app)
			[method]("/api/trips/alpine-panorama")
			.send({});

		expect(response.status).toBe(401);

		const trip = await Trip.findOne({ id: "alpine-panorama" });
		expect(trip).not.toBeNull();
		expect(trip.name).toBe("Alpine Panorama Express");
	},
);

test("public listings show only selected schedules", async () => {
	await Trip.updateOne(
		{ id: "alpine-panorama" },
		{ $set: { activeScheduleIds: [2] } },
	);

	const response = await request(app).get(
		"/api/trips/alpine-panorama/schedules",
	);

	expect(response.status).toBe(200);
	expect(response.body.map((schedule) => schedule.id)).toEqual([2]);
});

test("deselected schedules cannot be booked", async () => {
	await Trip.updateOne(
		{ id: "alpine-panorama" },
		{ $set: { activeScheduleIds: [2] } },
	);

	const page = await request(app).get("/trips/booking/1");
	expect(page.status).toBe(404);

	const submission = await request(app)
		.post("/trips/book")
		.send({ scheduleId: "1" });

	expect(submission.status).toBe(409);
});
