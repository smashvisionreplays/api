import express from 'express';
import { createLiveBroadcast, stopLiveBroadcast, generateAuthUrl, setTokenFromCode } from '../../youtube/youtube.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Create a new YouTube live broadcast
router.post('/create-live', requireAuth(), async (req, res) => {
  try {
    const { title, description, clubName, courtNumber } = req.body;
    const userId = req.auth.userId;
    
    const liveTitle = title || `${clubName} - Court ${courtNumber} Live`;
    const liveDescription = description || `Live stream from ${clubName}, Court ${courtNumber}`;
    
    const result = await createLiveBroadcast(liveTitle, liveDescription, userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          broadcastId: result.broadcastId,
          streamId: result.streamId,
          rtmpKey: result.streamKey,
          rtmpUrl: result.rtmpUrl,
          watchUrl: result.watchUrl,
          embedUrl: result.embedUrl
        }
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error in create-live route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Stop a YouTube live broadcast
router.post('/stop-live', requireAuth(), async (req, res) => {
  try {
    const { broadcastId } = req.body;
    const userId = req.auth.userId;
    
    if (!broadcastId) {
      return res.status(400).json({
        success: false,
        error: 'Broadcast ID is required'
      });
    }
    
    const result = await stopLiveBroadcast(broadcastId, userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error in stop-live route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get auth URL for setup
router.get('/auth-url', requireAuth(), (req, res) => {
  const userId = req.auth.userId;
  res.json({ authUrl: generateAuthUrl(userId) });
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  console.log('Received callback in youtubeRoutes with query: %j', req.query);
  try {
    const { code, state: userId } = req.query;
    if (!code) {
      return res.status(400).send('No authorization code received');
    }
    if (!userId) {
      return res.status(400).send('No user ID provided');
    }
    
    const refreshToken = await setTokenFromCode(code, userId);
    res.send(`
      <h1>✅ YouTube Authorization Complete!</h1>
      <p><strong>Your YouTube account has been connected!</strong></p>
      <p>You can close this window now.</p>
      <script>
        if (window.opener) {
          window.opener.postMessage('youtube-auth-complete', '*');
        }
        setTimeout(() => window.close(), 2000);
      </script>
    `);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Check if user has YouTube connected
router.get('/status', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { clerkClient } = await import('@clerk/express');
    const user = await clerkClient.users.getUser(userId);
    const hasYouTubeToken = !!user.privateMetadata?.youtubeRefreshToken;
    
    res.json({
      connected: hasYouTubeToken,
      authUrl: hasYouTubeToken ? null : generateAuthUrl(userId)
    });
  } catch (error) {
    console.error('Error checking YouTube status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Disconnect YouTube account
router.post('/disconnect', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { clerkClient } = await import('@clerk/express');
    
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        youtubeRefreshToken: null
      }
    });
    
    res.json({
      success: true,
      message: 'YouTube account disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting YouTube:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;