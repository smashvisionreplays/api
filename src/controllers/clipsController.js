import * as dbClips from "../../db/clips.js";
import * as dbCloudflare from "../../cloudflare/clips.js"

export const registerClip = async (req, res) => {
  const {uid, tag, clubId, userId, startTime, endTime } = req.body;

  // Create date for clip name
  const now = new Date();
  const localDate = now.toLocaleDateString('es-MX');
  let outputName = `${tag}_${userId}_${localDate}`; 

  // Upload to Cloudflare the clip
  const cloudflareUpload=await dbCloudflare.createClip(uid, startTime, endTime, outputName, '5ef6d8dd10a3d10b60e5e3ca79d729c9');

  console.log(`CloudflareUpload result is: ${cloudflareUpload}`);

  if (cloudflareUpload.success==true) {
    let clipUID = cloudflareUpload.result.uid;
    console.log("upload to cloudflare successful and clipUID is ", clipUID);
    let clipUrl = "https://customer-jziyepp812jvqg3n.cloudflarestream.com/" + clipUID + "/iframe";

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // Obtener la fecha actual
    const today = new Date();
    // Obtener el índice del día de la semana (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = today.getDay();
    // Obtener el nombre del día
    const dayName = daysOfWeek[dayOfWeek];

    let clipName = `${tag} - ${localDate}`;

    const clipRegistered = await dbClips.registerClip(clipName, dayName, tag, clipUrl, clipUID, clubId, userId);
    console.log("clipRegistered is: ", clipRegistered);

    clipRegistered.clipUID=clipUID;
    res.json({success:true, result:clipRegistered});
  } else {
    console.log("upload to cloudflare failed");
    res.json({success:false,error:"upload to cloudflare failed"});
  }
};

export const getClipsByClub = async (req, res) => {
  try {
    const clips = await dbClips.selectClips(true, req.params.id);
    res.json(clips);
  } catch (error) {
    console.error("Error fetching clips:", error);
    res.status(500).json({ error: "Failed to fetch clips" });
  }
};

export const getClipDownloadInfoDB = async (req, res) => {
    try {
      const download = await dbClips.selectDownloadURL(req.params.id);
      res.json(download);
    } catch (error) {
      console.error("Error fetching download url:", error);
      res.status(500).json({ error: "Failed to fetch download url" });
    }
  };
  
export const updateClipDownloadDB = async (req, res) => {
    const { downloadURL } = req.body;
    try {
      const download = await dbClips.updateDownloadURL(downloadURL, req.params.id);
      res.json(download);
    } catch (error) {
      console.error("Error updating download:", error);
      res.status(500).json({ error: "Failed to update download" });
    }
};

export const createClipDownload = async (req, res) => {
    try {
      const download = await dbCloudflare.createDownload(req.params.id);
      res.json(download);
    } catch (error) {
      console.error("Error creating clip download:", error);
      res.status(500).json({ error: "Failed to create download url" });
    }
};

export const getClipDownloadInfoCloudflare = async (req, res) => {
    try {
      const download = await dbCloudflare.getDownloadInfo(req.params.id);
      res.json(download);
    } catch (error) {
      console.error("Error fetching download url:", error);
      res.status(500).json({ error: "Failed to fetch download url" });
    }
};