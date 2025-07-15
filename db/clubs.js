import { query } from './db.js';

// Query all clubs
export const selectClubs = async () => {
    return await query('SELECT * FROM Clubs');
};

// Query individual club by ID
export const selectIndv_Club = async (id_club) => {
    return await query('SELECT * FROM Clubs WHERE ID = ?', [id_club]);
};

// Query individual club by name
export const selectIndv_ClubNombre = async (nombre_club) => {
    return await query('SELECT * FROM Clubs WHERE Name = ?', [nombre_club]);
};

// Query individual club ID by email
export const selectIndv_ClubEmail = async (email_club) => {
    return await query('SELECT ID FROM Clubs WHERE Email = ?', [email_club]);
};
