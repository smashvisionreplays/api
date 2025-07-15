import { query } from './db.js';

// Query clips by club status
export const selectClips = async (clubStatus, id) => {
    const sql = clubStatus
        ? 'SELECT * FROM Clips WHERE id_club = ? ORDER BY _createdDate DESC'
        : 'SELECT * FROM Clips WHERE id_user = ? ORDER BY _createdDate DESC LIMIT 10';
    return await query(sql, [id]);
};

// Insert a new clip into the Clips table
export const registerClip = async (clip_name, dayName, tag, url, uid, clubId, userId = null) => {
    const sql = userId
        ? 'INSERT INTO Clips (Clip_Name, Weekday, Tag, URL, UID, id_club, id_user) VALUES (?, ?, ?, ?, ?, ?, ?)'
        : 'INSERT INTO Clips (Clip_Name, Weekday, Tag, URL, UID, id_club) VALUES (?, ?, ?, ?, ?, ?)';
    const params = userId
        ? [clip_name, dayName, tag, url, uid, clubId, userId]
        : [clip_name, dayName, tag, url, uid, clubId];

    return await query(sql, params);
};

// Retrieve download URL for a clip
export const selectDownloadURL = async (UID) => {
    return await query('SELECT downloadURL FROM Clips WHERE UID = ?', [UID]);
};

// Update download URL for a clip
export const updateDownloadURL = async (downloadURL, UID) => {
    return await query('UPDATE Clips SET downloadURL = ? WHERE UID = ?', [downloadURL, UID]);
};
