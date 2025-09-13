import * as dbClubs from "../../db/clubs.js";

export const getAllClubs = async (req, res) => {
  try {
    const clubs = await dbClubs.selectClubs();
    res.json(clubs);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    res.status(500).json({ error: "Failed to fetch clubs", message: error });
  }
};

export const getClubById = async (req, res) => {
  try {
    const club = await dbClubs.selectIndv_Club(req.params.id);
    res.json(club);
  } catch (error) {
    console.error("Error fetching club:", error);
    res.status(500).json({ error: "Failed to fetch club", message: error });
  }
};