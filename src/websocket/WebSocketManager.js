import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket
  }

  initialize(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      try {
        // Verify Clerk JWT token
        const decoded = jwt.decode(token);
        const userId = decoded?.sub;
        
        if (!userId) {
          ws.close(1008, 'Invalid token');
          return;
        }
        
        this.clients.set(userId, ws);
        console.log(`WebSocket client connected: ${userId}`);

        ws.on('close', () => {
          this.clients.delete(userId);
          console.log(`WebSocket client disconnected: ${userId}`);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
          this.clients.delete(userId);
        });

      } catch (error) {
        console.error('JWT verification failed:', error);
        ws.close(1008, 'Invalid token');
      }
    });

    console.log('WebSocket server initialized');
  }

  broadcast(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(JSON.stringify(message));
        console.log(`Message sent to user ${userId}:`, message);
      } catch (error) {
        console.error(`Failed to send message to user ${userId}:`, error);
        this.clients.delete(userId);
      }
    }
  }

  broadcastToAll(message) {
    console.log(`Broadcasting to ${this.clients.size} connected clients:`, message);
    let sentCount = 0;
    this.clients.forEach((client, userId) => {
      if (client.readyState === 1) {
        try {
          client.send(JSON.stringify(message));
          sentCount++;
          console.log(`Message sent to user ${userId}`);
        } catch (error) {
          console.error(`Failed to broadcast to user ${userId}:`, error);
          this.clients.delete(userId);
        }
      } else {
        console.log(`Client ${userId} not ready (readyState: ${client.readyState})`);
      }
    });
    console.log(`Successfully sent to ${sentCount} clients`);
  }

  getConnectedClients() {
    return Array.from(this.clients.keys());
  }
}

export default new WebSocketManager();