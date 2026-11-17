import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/ticket-classes', () => {
    test('returns all ticket classes', async () => {
        const response = await request(app).get('/api/ticket-classes');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body.ticketClasses).toHaveLength(3);
        expect(response.body.ticketClasses).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    class: 'standard',
                    availableDays: expect.any(Array)
                })
            ])
        );
    });

    test('filters ticket classes by a valid weekday', async () => {
        const response = await request(app)
            .get('/api/ticket-classes')
            .query({ day: 'saturday' });

        expect(response.status).toBe(200);
        expect(response.body.ticketClasses).toHaveLength(2);
        expect(response.body.ticketClasses).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ class: 'standard' }),
                expect.objectContaining({ class: 'first' })
            ])
        );
    });

    test('normalizes a weekday before filtering', async () => {
        const response = await request(app)
            .get('/api/ticket-classes')
            .query({ day: 'Monday' });

        expect(response.status).toBe(200);
        expect(response.body.ticketClasses).toHaveLength(2);
        expect(response.body.ticketClasses).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ class: 'standard' }),
                expect.objectContaining({ class: 'premium' })
            ])
        );
    });

    test('rejects an invalid weekday', async () => {
        const response = await request(app)
            .get('/api/ticket-classes')
            .query({ day: 'holiday' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: 'Invalid day. Use a weekday from monday through sunday.'
        });
    });
});
