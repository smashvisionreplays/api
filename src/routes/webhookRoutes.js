import express from 'express';
import { Webhook } from 'svix';
import WebSocketManager from '../websocket/WebSocketManager.js';
import { updateCameraLiveStatus } from '../../db/cameras.js';
import { insertClerkUser, updateClerkUser, deleteClerkUser, getUserByClerkId } from '../../db/users.js';

const router = express.Router();

// Function to update Clerk user metadata
const updateClerkUserMetadata = async (clerkId, publicMetadata, privateMetadata) => {
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: publicMetadata,
        private_metadata: privateMetadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating Clerk user metadata:', error);
    throw error;
  }
};

// Test endpoint to verify webhook route is accessible
router.get('/test', (req, res) => {
  console.log('Webhook test endpoint hit');
  res.status(200).json({ message: 'Webhook endpoint is accessible', timestamp: new Date().toISOString() });
});

// Middleware for different webhook types
router.use('/clerk', express.raw({ type: 'application/json' }));
router.use('/live-status', express.json());

// Clerk webhook handler
router.post('/clerk', async (req, res) => {
  console.log('=== Clerk Webhook Received ===');
  console.log('Headers:', req.headers);
  console.log('Body type:', typeof req.body);
  console.log('Body length:', req.body?.length);
  
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SIGNING_SECRET');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature']
    };
    const payload = req.body;

    console.log('Webhook headers for verification:', headers);

    // Verify the webhook
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, headers);
      console.log('Webhook verification successful');
    } catch (err) {
      console.error('Error verifying webhook:', err.message);
      return res.status(400).json({ error: 'Error verifying webhook', details: err.message });
    }

    const { id, type, data } = evt;
    console.log(`Received Clerk webhook with ID ${id} and type ${type}`);

    // Handle different event types
    switch (type) {
      case 'user.created':
        try {
          const { id: clerkId, email_addresses, first_name, last_name } = data;
          const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
          
          if (primaryEmail) {
            const result = await insertClerkUser(clerkId, primaryEmail.email_address, first_name, last_name);
            console.log(`User created in database: ${clerkId} - ${primaryEmail.email_address}`);
            
            // Get the database ID from the insert result
            const dbUserId = result.insertId;
            
            // Update Clerk user metadata
            await updateClerkUserMetadata(
              clerkId,
              { role: 'member' },
              { id: dbUserId.toString() }
            );
            console.log(`Updated Clerk user metadata for ${clerkId} with DB ID: ${dbUserId}`);
          }
        } catch (error) {
          console.error('Error creating user:', error);
        }
        break;

      case 'user.updated':
        try {
          const { id: clerkId, email_addresses, first_name, last_name } = data;
          const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
          
          if (primaryEmail) {
            const existingUser = await getUserByClerkId(clerkId);
            if (existingUser) {
              await updateClerkUser(clerkId, primaryEmail.email_address, first_name, last_name);
              console.log(`User updated in database: ${clerkId} - ${primaryEmail.email_address}`);
            }
          }
        } catch (error) {
          console.error('Error updating user:', error);
        }
        break;

      case 'user.deleted':
        try {
          const { id: clerkId } = data;
          await deleteClerkUser(clerkId);
          console.log(`User deleted from database: ${clerkId}`);
        } catch (error) {
          console.error('Error deleting user:', error);
        }
        break;

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    console.log('Webhook processed successfully');
    res.status(200).json({ received: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/live-status', async (req, res) => {
  console.log('in /live-status:', req.body);
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