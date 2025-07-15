import { query } from './db.js';

// Insert a new user into the Users table
export const insertUser = async (name, email, password, contactID) => {
    return await query('INSERT INTO Users (Name, Email, Password, ContactID) VALUES (?, ?, ?, ?)', [name, email, password, contactID]);
};

// Validate if a user exists by email
export const validateUser = async (email) => {
    const results = await query('SELECT * FROM Users WHERE Email = ?', [email]);
    return results.length > 0;
};

// Retrieve generated clips by user email
export const getGeneratedClips = async (email) => {
    return await query('SELECT ID, generatedClips FROM Users WHERE Email = ?', [email]);
};

// Update the generated clips count for a user
export const updateUserClips = async (generatedClips, email) => {
    return await query('UPDATE Users SET generatedClips = ? WHERE Email = ?', [generatedClips + 1, email]);
};

// Retrieve contact ID by email and password
export const selectContactID = async (email, password) => {
    return await query('SELECT ContactID FROM Users WHERE Email = ? AND Password = ?', [email, password]);
};
