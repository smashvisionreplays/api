import express from 'express';
import { createLiveBroadcast, stopLiveBroadcast, generateAuthUrl, setTokenFromCode } from '../../youtube/youtube.js';

const router = express.Router();

// Create a new YouTube live broadcast
router.post('/create-live', async (req, res) => {
  try {
    const { title, description, clubName, courtNumber } = req.body;
    
    const liveTitle = title || `${clubName} - Court ${courtNumber} Live`;
    const liveDescription = description || `Live stream from ${clubName}, Court ${courtNumber}`;
    
    const result = await createLiveBroadcast(liveTitle, liveDescription);
    
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
router.post('/stop-live', async (req, res) => {
  try {
    const { broadcastId } = req.body;
    
    if (!broadcastId) {
      return res.status(400).json({
        success: false,
        error: 'Broadcast ID is required'
      });
    }
    
    const result = await stopLiveBroadcast(broadcastId);
    
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
router.get('/auth-url', (req, res) => {
  res.json({ authUrl: generateAuthUrl() });
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  console.log('Received callback in youtubeRoutes with query: %j', req.query);
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('No authorization code received');
    }
    
    const refreshToken = await setTokenFromCode(code);
    res.send(`
      <h1>✅ YouTube Authorization Complete!</h1>
      <p><strong>Refresh token automatically saved!</strong></p>
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

export default router;