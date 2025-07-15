import { query } from './db.js';

// Queries for videos based on club ID, weekday, court, etc.
export const selectIndv_Video = async (id_club, weekday, court_number, hour, section) => {
    return await query(
        'SELECT * FROM Videos WHERE id_club = ? AND Weekday = ? AND Court_Number = ? AND Hour = ? AND Hour_Section = ?',
        [id_club, weekday, court_number, hour, section]
    );
};

// Query videos by club and court number
export const selectVideosPorClub = async (id_club) => {
    return await query('SELECT * FROM Videos WHERE id_club = ?', [id_club]);
};

// Update the "Blocked" status in Videos table
export const updateBlockedStatus = async (id_video, blocked) => {
    const newBlockedStatus = blocked === "No" ? "Sí" : "No";
    return await query('UPDATE Videos SET Blocked = ? WHERE ID = ?', [newBlockedStatus, id_video]);
};

// Query best points from a video
export const selectBestPoints = async (id_club, weekday, court_number, hour, section) => {
    console.log("Selecting best points...");
    return await query(
        'SELECT Time FROM bestPoints WHERE id_club = ? AND Court_Number = ? AND Hour = ? AND Section = ?', 
        [id_club, court_number, hour, section]
    );
};

export const blockVideo = async (videoId) => {
    return await query(
        'UPDATE Videos SET Blocked = "Si" WHERE ID = ?',
        [videoId]
    );
}

export const unblockVideo = async (videoId) => {
    return await query(
        'UPDATE Videos SET Blocked = "No" WHERE ID = ?',
        [videoId]
    );
}