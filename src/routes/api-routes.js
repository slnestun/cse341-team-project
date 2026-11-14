import { getSchedulesForTripAndMonth } from '../controllers/schedules.js';

/**
 * @swagger
 * /api/trips/{id}/schedules:
 *   get:
 *     summary: Retrieve schedules for a specific trip, optionally filtered by month
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *         description: Optional month number to filter schedules
 *     responses:
 *       200:
 *         description: A list of schedules for the trip
 *       500:
 *         description: Server error
 */
router.get('/trips/:id/schedules', getSchedulesForTripAndMonth);