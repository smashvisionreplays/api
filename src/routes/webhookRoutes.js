import express from 'express';
import WebSocketManager from '../websocket/WebSocketManager.js';
import { updateCameraLiveStatus } from '../../db/cameras.js';

const router = express.Router();

router.post('/live-status', async (req, res) => {
  try {
    const { cameraId, status, url, notes, clubId } = req.body;
    
    console.log('Received webhook:', { cameraId, status, url, notes, clubId });
    
    // Update database
    await updateCameraLiveStatus(cameraId, status, url, notes);
    
    // Broadcast reload signal to WebSocket clients
    const message = {
      type: 'RELOAD_CAMERAS'
    };
    
    console.log('Broadcasting WebSocket reload signal:', message);
    console.log('Connected clients:', WebSocketManager.getConnectedClients().length);
    WebSocketManager.broadcastToAll(message);
    
    res.json({ success: true, message: 'Status updated and broadcasted' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;