import express from "express";
import { getClipDownloadInfoDB, getClipsByClub, getClipsByMember, updateClipDownloadDB, registerClip, getClipDownloadInfoCloudflare, createClipDownload } from "../controllers/clipsController.js";

const router = express.Router();

router.post("/", registerClip);
router.get("/club/:id", getClipsByClub);
router.get("/member/:id", getClipsByMember);
router.get("/:id/cloudflare/download", getClipDownloadInfoCloudflare);
router.get("/:id/download", getClipDownloadInfoDB);
router.post("/:id/download", createClipDownload);
router.put("/:id/download", updateClipDownloadDB);

export default router;
