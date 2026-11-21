
const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Kizuna Rail API',
        version: '1.0.0',
        description: 'API documentation for the Kizuna Rail train booking application.'
    },
    servers: [
        {
            url: '/',
            description: 'Current application server'
        }
    ],
    tags: [
        {
            name: 'Trips',
            description: 'Scenic train trip information'
        },
        {
            name: 'Schedules',
            description: 'Trip schedule information'
        },
        {
            name: 'Trains',
            description: 'Train information'
        }
    ],
    paths: {
        '/api/trips': {
            get: {
                tags: ['Trips'],
                summary: 'Get all trips',
                description: 'Returns all available scenic train trips.',
                responses: {
                    200: {
                        description: 'Trips retrieved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        trips: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/Trip'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Unable to retrieve trips.'
                    }
                }
            }
        },
        '/api/trips/{id}': {
            get: {
                tags: ['Trips'],
                summary: 'Get a trip by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'The unique trip ID.',
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Trip retrieved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Trip'
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Trip not found.'
                    },
                    500: {
                        description: 'Unable to retrieve trip.'
                    }
                }
            }
        },
        '/api/trips/{id}/schedules': {
            get: {
                tags: ['Schedules'],
                summary: 'Get schedules for a trip',
                description: 'Returns schedules for a specific trip, optionally filtered by operating month (1-12).',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'The unique trip ID or slug.',
                        schema: {
                            type: 'string',
                            example: 'alpine-panorama'
                        }
                    },
                    {
                        name: 'month',
                        in: 'query',
                        required: false,
                        description: 'Optional month filter as an integer from 1 to 12.',
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 12,
                            example: 4
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Schedules retrieved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Schedule'
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Invalid month query parameter (must be an integer between 1 and 12).'
                    },
                    500: {
                        description: 'Failed to fetch schedules for trip.'
                    }
                }
            }
        },
        '/api/trains': {
            get: {
                tags: ['Trains'],
                summary: 'Get all trains',
                description: 'Returns all available trains.',
                responses: {
                    200: {
                        description: 'Trains retrieved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        trains: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/Train'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Unable to retrieve trains.'
                    }
                }
            }
        },
        '/api/trains/{id}': {
            get: {
                tags: ['Trains'],
                summary: 'Get a train by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Train retrieved successfully.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Train'
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Train not found.'
                    },
                    500: {
                        description: 'Unable to retrieve train.'
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            Trip: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'trip-001' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    region: { type: 'string' },
                    startStation: { type: 'string' },
                    endStation: { type: 'string' },
                    duration: { type: 'string' },
                    distance: { type: 'number' },
                    highlights: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    bestSeason: { type: 'string' },
                    operatingMonths: {
                        type: 'array',
                        items: { type: 'integer' }
                    },
                    imageUrl: { type: 'string' }
                }
            },
            Schedule: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    tripId: { type: 'string', example: 'alpine-panorama' },
                    trainId: { type: 'string', example: 'shinano-express' },
                    departureTime: { type: 'string', example: '09:00' },
                    arrivalTime: { type: 'string', example: '12:30' },
                    daysOfWeek: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['Monday', 'Wednesday', 'Friday']
                    },
                    price: { type: 'number', example: 120 },
                    availableSeats: { type: 'integer', example: 40 }
                }
            },
            Train: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    operator: { type: 'string' },
                    type: { type: 'string' },
                    maxSpeedKmh: { type: 'number' },
                    capacity: { type: 'number' },
                    powerSource: { type: 'string' },
                    description: { type: 'string' },
                    bestFor: { type: 'string' },
                    imageUrl: { type: 'string' }
                }
            }
        }
    }
};

export default openApiSpec;