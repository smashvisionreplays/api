import express from "express";
import { getAllClubs, getClubById } from "../controllers/clubController.js";

const router = express.Router();

router.get("/", getAllClubs);
router.get("/:id", getClubById);

export default router;
