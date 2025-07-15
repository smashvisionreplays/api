import express from "express";
import { getCamerasByClub, startLiveStream, stopLiveStream } from "../controllers/cameraController.js";

const router = express.Router();

router.post("/:id/startLive", startLiveStream);
router.post("/:id/stopLive", stopLiveStream);
router.get("/club/:id", getCamerasByClub );

export default router;
