import { Router } from "express";
import { getAllBookings } from "../controllers/bookings.js";

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Retrieve all bookings
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *             example:
 *               bookings: []
 *       500:
 *         description: Unable to load bookings
 *         content:
 *           application/json:
 *             example:
 *               error: Unable to load bookings.
 */

router.get("/bookings", getAllBookings);

export default router;
