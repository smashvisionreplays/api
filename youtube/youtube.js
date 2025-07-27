import { google } from 'googleapis';
import { clerkClient } from '@clerk/express';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID?.trim();
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET?.trim();

const createOAuth2Client = (userId = null) => {
  const oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    'http://localhost:5000/api/youtube/callback'
  );
  
  return oauth2Client;
};

export const generateAuthUrl = (userId) => {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube'],
    prompt: 'consent',
    state: userId // Pass userId in state to retrieve it in callback
  });
};

export const setTokenFromCode = async (code, userId) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  
  if (tokens.refresh_token && userId) {
    await saveRefreshTokenToClerk(userId, tokens.refresh_token);
  }
  
  return tokens.refresh_token;
};

const saveRefreshTokenToClerk = async (userId, refreshToken) => {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        youtubeRefreshToken: refreshToken
      }
    });
    console.log('✅ Refresh token saved to Clerk user metadata');
  } catch (error) {
    console.error('❌ Error saving refresh token to Clerk:', error);
    throw error;
  }
};

const getRefreshTokenFromClerk = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user.privateMetadata?.youtubeRefreshToken;
  } catch (error) {
    console.error('❌ Error getting refresh token from Clerk:', error);
    return null;
  }
};

const getAccessToken = async (userId) => {
  try {
    const refreshToken = await getRefreshTokenFromClerk(userId);
    if (!refreshToken) {
      throw new Error('No YouTube refresh token found for user');
    }
    
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

const createLiveBroadcast = async (title, description, userId) => {
  try {
    const refreshToken = await getRefreshTokenFromClerk(userId);
    if (!refreshToken) {
      return {
        success: false,
        error: 'YouTube not configured. Need to authenticate.',
        authUrl: generateAuthUrl(userId),
        needsAuth: true
      };
    }

    const accessToken = await getAccessToken(userId);
    
    // Create broadcast
    const broadcastResponse = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          scheduledStartTime: new Date().toISOString()
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        },
        contentDetails: {
          enableAutoStart: true,
          enableAutoStop: true
        }
      })
    });

    if (!broadcastResponse.ok) {
      const error = await broadcastResponse.json();
      throw new Error(`Broadcast creation failed: ${JSON.stringify(error)}`);
    }

    const broadcast = await broadcastResponse.json();

    // Create stream
    const streamResponse = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          title: `${title} - Stream`
        },
        cdn: {
          frameRate: '30fps',
          ingestionType: 'rtmp',
          resolution: '720p'
        }
      })
    });

    if (!streamResponse.ok) {
      const error = await streamResponse.json();
      throw new Error(`Stream creation failed: ${JSON.stringify(error)}`);
    }

    const stream = await streamResponse.json();

    // Bind broadcast to stream
    const bindResponse = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id&id=${broadcast.id}&streamId=${stream.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!bindResponse.ok) {
      const error = await bindResponse.json();
      throw new Error(`Binding failed: ${JSON.stringify(error)}`);
    }

    return {
      success: true,
      broadcastId: broadcast.id,
      streamId: stream.id,
      streamKey: stream.cdn.ingestionInfo.streamName,
      rtmpUrl: stream.cdn.ingestionInfo.ingestionAddress,
      embedUrl: `https://www.youtube.com/embed/${broadcast.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${broadcast.id}`,
      title: broadcast.snippet.title,
      status: broadcast.status.lifeCycleStatus
    };

  } catch (error) {
    console.error('Error creating YouTube live broadcast:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const stopLiveBroadcast = async (broadcastId, userId) => {
  try {
    const accessToken = await getAccessToken(userId);
    
    const response = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?part=status&id=${broadcastId}&broadcastStatus=complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stop broadcast failed: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    return {
      success: true,
      broadcastId,
      status: result.status.lifeCycleStatus,
      message: 'Live broadcast stopped successfully'
    };
  } catch (error) {
    console.error('Error stopping YouTube live broadcast:', error);
    return {
      success: false,
      error: error.message,
      broadcastId
    };
  }
};

const startClubStream = async (clubName, cameraIP, streamData) => {
  try {
    const clubEndpoint = `https://${clubName}.smashvisionreplays.website/camera/${cameraIP}/start`;
    
    const response = await fetch(clubEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rtspUrl: streamData.rtspUrl,
        youtubeUrl: `${streamData.rtmpUrl}/${streamData.streamKey}`,
        courtNumber: streamData.courtNumber,
        cameraId: streamData.cameraId,
        clubId: streamData.clubId,
      }),
    });

    const result = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data: result,
    };
  } catch (error) {
    console.error('Error starting club stream:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const stopClubStream = async (clubName, containerId) => {
  try {
    const clubEndpoint = `https://${clubName}.smashvisionreplays.website/camera/${containerId}/stop`;
    
    const response = await fetch(clubEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data: result,
    };
  } catch (error) {
    console.error('Error stopping club stream:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export {
  createLiveBroadcast,
  stopLiveBroadcast,
  startClubStream,
  stopClubStream
};