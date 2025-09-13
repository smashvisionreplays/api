import express from "express";
import { getVideoById, getVideosByParams, getVideoBestPoints, getVideosByClub, blockVideo, unblockVideo } from "../controllers/videoController.js";
import { message } from "antd";

const router = express.Router();

router.get("/:id", getVideoById);
router.get("/club/:id", getVideosByClub);
router.post("/bestPoints", getVideoBestPoints);
router.put("/:id/block", blockVideo);
router.put("/:id/unblock", unblockVideo);
router.post("/", getVideosByParams);

// Add GET route for mobile app
router.get("/", (req, res) => {
  // Convert query parameters to body format expected by getVideosByParams
  req.body = req.query;
  getVideosByParams(req, res);
});

// Add Cloudflare Stream video details endpoint FOR MOBILE
router.get("/stream/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    if (data.success && data.result.playback) {
      res.json({ playbackUrl: data.result.playback.hls });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    console.error('Error fetching Cloudflare video:', error);
    res.status(500).json({ error: 'Failed to fetch video details', message:error });
  }
});

export default router;