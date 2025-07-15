import express from "express";
import { createClerkClient } from "@clerk/express";

const router = express.Router();

// Get user metadata including private data
router.get("/metadata/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching metadata for user:", userId);
    
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(userId);
    console.log("User data:", user.publicMetadata, user.privateMetadata);
    
    const userData = {
      role: user.publicMetadata?.role || 'member',
      id: user.privateMetadata?.id
    };
    
    res.json(userData);
  } catch (error) {
    console.error("Error fetching user metadata:", error.message);
    res.status(500).json({ error: "Failed to fetch user metadata", details: error.message });
  }
});

export default router;