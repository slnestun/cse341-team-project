import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /trips/booking/:scheduleId', () => {
    test('renders ticket classes and the availability endpoint', async () => {
        const response = await request(app).get('/trips/booking/2');

        expect(response.status).toBe(200);
        expect(response.text).toContain('data-ticket-class="standard"');
        expect(response.text).toContain('data-ticket-class="premium"');
        expect(response.text).toContain('data-ticket-class="first"');
        expect(response.text).toContain('/api/ticket-classes?day=');
    });
});
