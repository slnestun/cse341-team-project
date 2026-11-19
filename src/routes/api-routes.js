import { Router } from "express";
import { getAllStations, getStationById } from "../controllers/stations.js";

const apiRouter = Router();

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Retrieve all stations
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: A list of all stations
 *       500:
 *         description: Failed to fetch stations
 */
apiRouter.get("/stations", getAllStations);

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Retrieve a single station by ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The station ID (e.g., nagoya, osaka)
 *     responses:
 *       200:
 *         description: Station details
 *       404:
 *         description: Station not found
 *       500:
 *         description: Failed to fetch station
 */
apiRouter.get("/stations/:id", getStationById);

export default apiRouter;