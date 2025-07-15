import { query } from './db.js';

// Query cameras by club ID
export const selectCamerasByClub = async (id_club) => {
    return await query('SELECT * FROM Cameras WHERE id_club = ?', [id_club]);
};

// Update live status and related fields in Cameras table
export const updateLiveStatus = async (camera_id, club_id, status, notes, url=null, containerId=null) => {
    const sql ='UPDATE Cameras SET liveStatus = ?, liveUrl = ?, liveNotes = ?, liveContainerId = ? WHERE id_club = ? AND ID = ?'
    const params = [status, url, notes, containerId, club_id, camera_id]
    return await query(sql, params);
};
