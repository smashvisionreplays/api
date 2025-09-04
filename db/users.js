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

// Insert user from Clerk webhook
export const insertClerkUser = async (clerkId, email, firstName, lastName) => {
    const name = `${firstName || ''} ${lastName || ''}`.trim() || email;
    return await query('INSERT INTO Users (ClerkID, Name, Email, generatedClips) VALUES (?, ?, ?, 0)', [clerkId, name, email]);
};

// Update user from Clerk webhook
export const updateClerkUser = async (clerkId, email, firstName, lastName) => {
    const name = `${firstName || ''} ${lastName || ''}`.trim() || email;
    return await query('UPDATE Users SET Name = ?, Email = ? WHERE ClerkID = ?', [name, email, clerkId]);
};

// Delete user from Clerk webhook
export const deleteClerkUser = async (clerkId) => {
    return await query('DELETE FROM Users WHERE ClerkID = ?', [clerkId]);
};

// Check if user exists by Clerk ID
export const getUserByClerkId = async (clerkId) => {
    const results = await query('SELECT * FROM Users WHERE ClerkID = ?', [clerkId]);
    return results.length > 0 ? results[0] : null;
};
