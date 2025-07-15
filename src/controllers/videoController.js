import * as db from "../../db/videos.js";
import * as cloudflare from "../controllers/cloudflareController.js";

export const getVideoById = async (req, res) => {
  try {
    const videoData = await cloudflare.getVideoData(req.params.id);
    res.json(videoData);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
};

export const getVideosByParams = async (req, res) => {
  const { id_club, weekday, court_number, hour, section } = req.body;
  try {
    const videos = await db.selectIndv_Video(id_club, weekday, court_number, hour, section);
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

export const getVideosByClub = async (req, res) => {
  try {
    const videos = await db.selectVideosPorClub(req.params.id);
    res.json(videos);
  } catch (error) {
    console.error("Error fetching club videos:", error);
    res.status(500).json({ error: "Failed to fetch club videos" });
  }
};

export const getVideoBestPoints = async (req, res) => {
    console.log("in videoController Getting best points...");
    const { id_club, weekday, court_number, hour, section } = req.body;
    try {
        const bestPoints = await db.selectBestPoints(id_club, weekday, court_number, hour, section);
        res.json(bestPoints);
    } catch (error) {
        console.error("Error fetching best points:", error);
        res.status(500).json({ error: "Failed to fetch best points" });
    }
    }

export const blockVideo = async (req, res) => {
  try {
    await db.blockVideo(req.params.id);
    res.json({ message: "Video blocked" });
  } catch (error) {
    console.error("Error blocking video:", error);
    res.status(500).json({ error: "Failed to block video" });
  }
};

export const unblockVideo = async (req, res) => {
  try {
    await db.unblockVideo(req.params.id);
    res.json({ message: "Video unblocked" });
  } catch (error) {
    console.error("Error unblocking video:", error);
    res.status(500).json({ error: "Failed to unblock video" });
  }
}
