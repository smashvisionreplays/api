import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'http';
import { clerkMiddleware } from '@clerk/express';
import clubRoutes from "./src/routes/clubRoutes.js";
import videoRoutes from "./src/routes/videoRoutes.js";
import cameraRoutes from "./src/routes/cameraRoutes.js";
import clipRoutes from "./src/routes/clipRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import youtubeRoutes from "./src/routes/youtubeRoutes.js";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import WebSocketManager from "./src/websocket/WebSocketManager.js";

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
app.use("/webhooks", webhookRoutes);

// Create HTTP server and initialize WebSocket
const server = createServer(app);
WebSocketManager.initialize(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});