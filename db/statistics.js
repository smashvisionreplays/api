import { query } from './db.js';

// Get clips history by club and time range
export const getClipsHistoryByClubAndTime = async (clubId, startDate, endDate) => {
    const sql = 'CALL GetClipsHistoryByClubAndTime(?, ?, ?)';
    const result = await query(sql, [clubId, startDate, endDate]);
    return result[0] || []; // Return first result set from stored procedure
};

// Get best points history by club and time range (assuming similar stored procedure exists)
export const getBestPointsHistoryByClubAndTime = async (clubId, startDate, endDate) => {
    const sql = 'CALL GetBestPointsHistoryByClubAndTime(?, ?, ?)';
    const result = await query(sql, [clubId, startDate, endDate]);
    return result[0] || []; // Return first result set from stored procedure
};