// Example Frontend Integration for YouTube + Clerk

// 1. Check if user has YouTube connected
const checkYouTubeStatus = async () => {
  try {
    const response = await fetch('/api/youtube/status', {
      headers: {
        'Authorization': `Bearer ${await clerk.session.getToken()}`
      }
    });
    const data = await response.json();
    return data; // { connected: boolean, authUrl?: string }
  } catch (error) {
    console.error('Error checking YouTube status:', error);
    return { connected: false };
  }
};

// 2. Connect YouTube account
const connectYouTube = async () => {
  const status = await checkYouTubeStatus();
  if (!status.connected && status.authUrl) {
    // Open popup for OAuth
    const popup = window.open(status.authUrl, 'youtube-auth', 'width=500,height=600');
    
    // Listen for completion
    return new Promise((resolve) => {
      const messageListener = (event) => {
        if (event.data === 'youtube-auth-complete') {
          window.removeEventListener('message', messageListener);
          popup.close();
          resolve(true);
        }
      };
      window.addEventListener('message', messageListener);
    });
  }
  return status.connected;
};

// 3. Create live stream
const createLiveStream = async (title, description, clubName, courtNumber) => {
  try {
    const response = await fetch('/api/youtube/create-live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await clerk.session.getToken()}`
      },
      body: JSON.stringify({
        title,
        description,
        clubName,
        courtNumber
      })
    });
    
    const result = await response.json();
    
    if (result.needsAuth) {
      // User needs to authenticate first
      const connected = await connectYouTube();
      if (connected) {
        // Retry after authentication
        return createLiveStream(title, description, clubName, courtNumber);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error creating live stream:', error);
    return { success: false, error: error.message };
  }
};

// 4. Stop live stream
const stopLiveStream = async (broadcastId) => {
  try {
    const response = await fetch('/api/youtube/stop-live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await clerk.session.getToken()}`
      },
      body: JSON.stringify({ broadcastId })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error stopping live stream:', error);
    return { success: false, error: error.message };
  }
};

// 5. Disconnect YouTube
const disconnectYouTube = async () => {
  try {
    const response = await fetch('/api/youtube/disconnect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await clerk.session.getToken()}`
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error disconnecting YouTube:', error);
    return { success: false, error: error.message };
  }
};

// Example usage in a React component:
/*
const YouTubeLiveComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveStream, setLiveStream] = useState(null);

  useEffect(() => {
    checkYouTubeStatus().then(status => {
      setIsConnected(status.connected);
    });
  }, []);

  const handleCreateLive = async () => {
    const result = await createLiveStream(
      "My Live Stream",
      "Live from my club",
      "MyClub",
      1
    );
    
    if (result.success) {
      setLiveStream(result.data);
      console.log('Stream URL:', result.data.watchUrl);
      console.log('RTMP URL:', result.data.rtmpUrl);
      console.log('Stream Key:', result.data.rtmpKey);
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectYouTube}>Connect YouTube</button>
      ) : (
        <div>
          <button onClick={handleCreateLive}>Create Live Stream</button>
          {liveStream && (
            <div>
              <p>Stream created! <a href={liveStream.watchUrl} target="_blank">Watch</a></p>
              <button onClick={() => stopLiveStream(liveStream.broadcastId)}>
                Stop Stream
              </button>
            </div>
          )}
          <button onClick={disconnectYouTube}>Disconnect YouTube</button>
        </div>
      )}
    </div>
  );
};
*/