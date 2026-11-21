import listTripsPage from "./list.js";
import tripDetailsPage from "./details.js";
import { Router } from "express";

const router = Router();

router.get("/", listTripsPage);
router.get("/:tripId", tripDetailsPage);

export default router;