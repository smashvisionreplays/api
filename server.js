import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express';
import clubRoutes from "./src/routes/clubRoutes.js";
import videoRoutes from "./src/routes/videoRoutes.js";
import cameraRoutes from "./src/routes/cameraRoutes.js";
import clipRoutes from "./src/routes/clipRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import youtubeRoutes from "./src/routes/youtubeRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use("/api/clubs", clubRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/clips", clipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/youtube", youtubeRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));