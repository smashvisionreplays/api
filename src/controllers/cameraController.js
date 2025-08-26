import * as db from "../../db/cameras.js";

export const startLiveStream = async (req, res) => {
  const { clubId, cameraId, court, cameraIp, rtmpKey, clubEndpoint, watchUrl } = req.body;
  try {
    
    const streamUrl = `${clubEndpoint}camera/${cameraIp}/start`;
    const bodyPayload = {
      rtspUrl: `rtsp://admin:123456@${cameraIp}/stream0`,
      youtubeUrl: `rtmp://a.rtmp.youtube.com/live2/${rtmpKey}`,
      courtNumber: court,
      cameraId:cameraId,
      clubId:clubId,
      watchUrl:watchUrl
    };
    //FOR NEW CAMERA REOLINK
    // const bodyPayload = {
    //   rtspUrl: `rtsp://admin:3L3m3nt!@${cameraIp}`,
    //   youtubeUrl: `rtmp://a.rtmp.youtube.com/live2/${rtmpKey}`,
    //   courtNumber: court,
    //   cameraId:cameraId,
    //   clubId:clubId,
    //   watchUrl:watchUrl
    // };

    const response = await fetch(streamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });

    /*This initial response from the club-server if 202 will have this format:
       res.status(202).json({
         message: `Connecting stream for camera ${cameraIP}...`,
         liveStatus: "Connecting",
         cameraId:cameraId,
         clubId: clubId,
         courtNumber: courtNumber,
       });
    */
    if (!response.ok) throw new Error(`Failed request to ${streamUrl}`);

    const responseData = await response.json();
    console.log("gonna update db watchurl is", watchUrl);
    await db.updateLiveStatus(cameraId, clubId, responseData.liveStatus, responseData.message, watchUrl, responseData.containerId);

    res.json({ message: "Live stream started", data: responseData });
  } catch (error) {
    console.error("Error starting live stream:", error);
    res.status(500).json({ error: "Failed to start live stream" });
  }
};

export const stopLiveStream = async (req, res) => {
  const { clubId, cameraId, cameraIp, clubEndpoint } = req.body;
  try {
    const streamUrl = `${clubEndpoint}camera/${cameraIp}/stop`;

    const response = await fetch(streamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    console.log("response from stop from club server is : ",response)

    if (!response.ok) throw new Error(`Failed request to ${streamUrl}`);

    const responseData = await response.json();
    await db.updateLiveStatus(cameraId, clubId, "Off", "Stream stopped", null, null);

    res.json({ message: "Live stream stopped", data: responseData });
  } catch (error) {
    console.error("Error stopping live stream:", error);
    res.status(500).json({ error: "Failed to stop live stream" });
  }
};

export const getCamerasByClub = async (req, res) => {
  try {
    const cameras = await db.selectCamerasByClub(req.params.id);
    res.json(cameras);
  } catch (error) {
    console.error("Error fetching cameras:", error);
    res.status(500).json({ error: "Failed to fetch cameras" });
  }
};