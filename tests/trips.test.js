
import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Trip from '../src/models/schemas/trips.js';

describe('GET /api/trips', () => {
    test('returns a successful JSON response', async () => {
        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).toHaveProperty('trips');
        expect(response.body.trips).toBeInstanceOf(Array);
    });

    test('returns the Trips from the starter data', async () => {
        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(6);
        expect(response.body.trips).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'alpine-panorama',
                    name: expect.any(String)
                })
            ])
        );
    });

    test('returns a Trip added to the test database', async () => {
        await Trip.create({
            id: 'test-trip',
            name: 'Test Scenic Trip',
            description: 'A test trip for API verification.',
            region: 'central',
            startStation: 'Station A',
            endStation: 'Station B',
            duration: '2 hours',
            distance: 100,
            highlights: ['Mountain views'],
            bestSeason: 'spring',
            operatingMonths: [3, 4, 5]
        });

        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'test-trip',
                    name: 'Test Scenic Trip'
                })
            ])
        );
    });
});

describe('GET /api/trips/:id', () => {
    test('returns a Trip by its ID', async () => {
        const response = await request(app).get('/api/trips/alpine-panorama');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 'alpine-panorama');
        expect(response.body).toHaveProperty('name');
    });

    test('returns 404 when the Trip does not exist', async () => {
        const response = await request(app).get('/api/trips/nonexistent-trip');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Trip not found.');
    });
});
