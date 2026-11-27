const openApiSpec = {
	openapi: "3.0.3",
	info: {
		title: "Kizuna Rail API",
		version: "1.0.0",
		description:
			"API documentation for the Kizuna Rail train booking application.",
	},
	servers: [
		{
			url: "/",
			description: "Current application server",
		},
	],
	tags: [
		{
			name: "Trips",
			description: "Scenic train trip information",
		},
		{
			name: "Schedules",
			description: "Trip schedule information",
		},
		{
			name: "Trains",
			description: "Train information",
		},
		{
			name: "Stations",
			description: "Train station information",
		},
		{
			name: "Bookings",
			description: "Booking management information",
		},
		{
			name: "Ticket Classes",
			description: "Ticket class availability and pricing information",
		},
	],
	paths: {
		"/api/bookings": {
			get: {
				tags: ["Bookings"],
				summary: "Get all bookings",
				responses: {
					200: {
						description: "Bookings retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										bookings: {
											type: "array",
											items: {
												$ref: "#/components/schemas/Booking",
											},
										},
									},
								},
								example: { bookings: [] },
							},
						},
					},
					500: {
						description: "Unable to load bookings.",
						content: {
							"application/json": {
								example: {
									error: "Unable to load bookings.",
								},
							},
						},
					},
				},
			},
		},
		"/api/bookings/{id}": {
			parameters: [
				{
					name: "id",
					in: "path",
					required: true,
					description: "Booking confirmation code.",
					schema: {
						type: "string",
					},
					example: "JRDC07XW6Y",
				},
			],
			put: {
				tags: ["Bookings"],
				summary: "Update a booking",
				description:
					"Updates editable fields (`ticketClass`, `selectedDay`, `passengers`) of a booking. Admins can update any booking; customers can only update bookings that include their email in `passengers`.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									ticketClass: {
										type: "string",
									},
									selectedDay: {
										type: "string",
									},
									passengers: {
										type: "array",
										minItems: 1,
										items: {
											type: "object",
											required: ["firstName", "lastName", "email", "phone"],
											properties: {
												firstName: { type: "string" },
												lastName: { type: "string" },
												email: { type: "string", format: "email" },
												phone: { type: "string" },
											},
										},
									},
								},
							},
							example: {
								ticketClass: "first-class",
								selectedDay: "2026-12-10",
							},
						},
					},
				},
				responses: {
					200: {
						description: "Booking updated successfully.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										booking: {
											$ref: "#/components/schemas/Booking",
										},
									},
								},
							},
						},
					},
					400: {
						description: "Invalid update payload or missing editable fields.",
						content: {
							"application/json": {
								example: {
									error:
										"Provide at least one field to update (ticketClass, selectedDay, or passengers).",
								},
							},
						},
					},
					403: {
						description: "User does not have permission to update this booking.",
						content: {
							"application/json": {
								example: {
									error: "You do not have permission to update this booking.",
								},
							},
						},
					},
					404: {
						description: "Booking not found.",
						content: {
							"application/json": {
								example: {
									error: "Booking not found.",
								},
							},
						},
					},
					500: {
						description: "Unable to update booking.",
						content: {
							"application/json": {
								example: {
									error: "Unable to update booking.",
								},
							},
						},
					},
				},
			},
			delete: {
				tags: ["Bookings"],
				summary: "Delete a booking",
				description:
					"Deletes a booking by confirmation code. Admins can delete any booking; customers can only delete bookings that include their email in `passengers`.",
				responses: {
					200: {
						description: "Booking deleted successfully.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: { type: "string" },
										id: { type: "string" },
									},
								},
								example: {
									message: "Booking deleted successfully.",
									id: "JRDC07XW6Y",
								},
							},
						},
					},
					403: {
						description: "User does not have permission to delete this booking.",
						content: {
							"application/json": {
								example: {
									error: "You do not have permission to delete this booking.",
								},
							},
						},
					},
					404: {
						description: "Booking not found.",
						content: {
							"application/json": {
								example: {
									error: "Booking not found.",
								},
							},
						},
					},
					500: {
						description: "Unable to delete booking.",
						content: {
							"application/json": {
								example: {
									error: "Unable to delete booking.",
								},
							},
						},
					},
				},
			},
		},
		"/api/trips": {
			get: {
				tags: ["Trips"],
				summary: "Get all trips",
				description: "Returns all available scenic train trips.",
				responses: {
					200: {
						description: "Trips retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										trips: {
											type: "array",
											items: {
												$ref: "#/components/schemas/Trip",
											},
										},
									},
								},
							},
						},
					},
					500: {
						description: "Unable to retrieve trips.",
					},
				},
			},
		},
		"/api/trips/{id}": {
			get: {
				tags: ["Trips"],
				summary: "Get a trip by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						description: "The unique trip ID.",
						schema: {
							type: "string",
						},
					},
				],
				responses: {
					200: {
						description: "Trip retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/Trip",
								},
							},
						},
					},
					404: {
						description: "Trip not found.",
					},
					500: {
						description: "Unable to retrieve trip.",
					},
				},
			},
		},
		"/api/trips/{id}/schedules": {
			get: {
				tags: ["Schedules"],
				summary: "Get schedules for a trip",
				description:
					"Returns schedules for a specific trip, optionally filtered by operating month (1-12).",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						description: "The unique trip ID or slug.",
						schema: {
							type: "string",
							example: "alpine-panorama",
						},
					},
					{
						name: "month",
						in: "query",
						required: false,
						description: "Optional month filter as an integer from 1 to 12.",
						schema: {
							type: "integer",
							minimum: 1,
							maximum: 12,
							example: 4,
						},
					},
				],
				responses: {
					200: {
						description: "Schedules retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/Schedule",
									},
								},
							},
						},
					},
					400: {
						description:
							"Invalid month query parameter (must be an integer between 1 and 12).",
					},
					500: {
						description: "Failed to fetch schedules for trip.",
					},
				},
			},
		},
		"/api/trains": {
			get: {
				tags: ["Trains"],
				summary: "Get all trains",
				description: "Returns all available trains.",
				responses: {
					200: {
						description: "Trains retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										trains: {
											type: "array",
											items: {
												$ref: "#/components/schemas/Train",
											},
										},
									},
								},
							},
						},
					},
					500: {
						description: "Unable to retrieve trains.",
					},
				},
			},
		},
		"/api/trains/{id}": {
			get: {
				tags: ["Trains"],
				summary: "Get a train by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: {
							type: "string",
						},
					},
				],
				responses: {
					200: {
						description: "Train retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/Train",
								},
							},
						},
					},
					404: {
						description: "Train not found.",
					},
					500: {
						description: "Unable to retrieve train.",
					},
				},
			},
		},
		"/api/stations": {
			get: {
				tags: ["Stations"],
				summary: "Get all stations",
				description: "Returns a list of all train stations.",
				responses: {
					200: {
						description: "Stations retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/Station",
									},
								},
							},
						},
					},
					500: {
						description: "Failed to fetch stations.",
					},
				},
			},
		},
		"/api/stations/{id}": {
			get: {
				tags: ["Stations"],
				summary: "Get a station by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						description: "The unique station ID (e.g., nagoya, osaka).",
						schema: {
							type: "string",
							example: "nagoya",
						},
					},
				],
				responses: {
					200: {
						description: "Station retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/Station",
								},
							},
						},
					},
					404: {
						description: "Station not found.",
					},
					500: {
						description: "Failed to fetch station.",
					},
				},
			},
		},
		"/api/ticket-classes": {
			get: {
				tags: ["Ticket Classes"],
				summary: "Get ticket classes",
				description:
					"Returns all ticket classes or only the classes available for a requested weekday.",
				parameters: [
					{
						name: "day",
						in: "query",
						required: false,
						description: "Optional weekday used to filter ticket-class availability.",
						schema: {
							type: "string",
							enum: [
								"monday",
								"tuesday",
								"wednesday",
								"thursday",
								"friday",
								"saturday",
								"sunday",
							],
						},
					},
				],
				responses: {
					200: {
						description: "Ticket classes retrieved successfully.",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										ticketClasses: {
											type: "array",
											items: {
												$ref: "#/components/schemas/TicketClass",
											},
										},
									},
								},
							},
						},
					},
					400: {
						description: "The day query parameter is invalid.",
					},
					500: {
						description: "Unable to retrieve ticket classes.",
					},
				},
			},
		},
	},
	components: {
		schemas: {
			Booking: {
				type: "object",
				properties: {
					id: { type: "string", example: "JRDC07XW6Y" },
					createdAt: { type: "string", format: "date-time" },
					scheduleId: { type: "string" },
					tripId: { type: "string", example: "winter-wetlands" },
					ticketClass: { type: "string" },
					selectedDay: { type: "string", example: "monday" },
					passengers: {
						type: "array",
						items: {
							type: "object",
							required: ["firstName", "lastName", "email", "phone"],
							properties: {
								firstName: { type: "string" },
								lastName: { type: "string" },
								email: { type: "string" },
								phone: { type: "string" },
							},
						},
					},
				},
			},
			Trip: {
				type: "object",
				properties: {
					id: { type: "string", example: "trip-001" },
					name: { type: "string" },
					description: { type: "string" },
					region: { type: "string" },
					startStation: { type: "string" },
					endStation: { type: "string" },
					duration: { type: "string" },
					distance: { type: "number" },
					highlights: {
						type: "array",
						items: { type: "string" },
					},
					bestSeason: { type: "string" },
					operatingMonths: {
						type: "array",
						items: { type: "integer" },
					},
					imageUrl: { type: "string" },
				},
			},
			Schedule: {
				type: "object",
				properties: {
					id: { type: "number", example: 1 },
					tripId: { type: "string", example: "alpine-panorama" },
					trainId: { type: "string", example: "shinano-express" },
					departureTime: { type: "string", example: "09:00" },
					arrivalTime: { type: "string", example: "12:30" },
					daysOfWeek: {
						type: "array",
						items: { type: "string" },
						example: ["Monday", "Wednesday", "Friday"],
					},
					price: { type: "number", example: 120 },
					availableSeats: { type: "integer", example: 40 },
				},
			},
			TicketClass: {
				type: "object",
				properties: {
					class: { type: "string", example: "standard" },
					name: { type: "string", example: "Standard Class" },
					pricePerKm: { type: "number", example: 80 },
					amenities: {
						type: "array",
						items: { type: "string" },
					},
					description: { type: "string" },
					availableDays: {
						type: "array",
						items: {
							type: "string",
							enum: [
								"monday",
								"tuesday",
								"wednesday",
								"thursday",
								"friday",
								"saturday",
								"sunday",
							],
						},
					},
				},
			},
			Train: {
				type: "object",
				properties: {
					id: { type: "string" },
					name: { type: "string" },
					operator: { type: "string" },
					type: { type: "string" },
					maxSpeedKmh: { type: "number" },
					capacity: { type: "number" },
					powerSource: { type: "string" },
					description: { type: "string" },
					bestFor: { type: "string" },
					imageUrl: { type: "string" },
				},
			},
			Station: {
				type: "object",
				properties: {
					id: { type: "string", example: "nagoya" },
					name: { type: "string", example: "Nagoya Station" },
					prefecture: { type: "string", example: "Aichi" },
					region: { type: "string", example: "Chubu" },
					facilities: {
						type: "array",
						items: { type: "string" },
						example: ["wifi", "luggage_storage", "restaurants"],
					},
					description: { type: "string" },
				},
			},
		},
	},
};

export default openApiSpec;