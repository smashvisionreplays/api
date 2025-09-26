import { getClipsHistoryByClubAndTime, getBestPointsHistoryByClubAndTime } from '../../db/statistics.js';

export const getStatistics = async (req, res) => {
    try {
        const { clubId, startDate, endDate } = req.query;
        
        if (!clubId || !startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Missing required parameters: clubId, startDate, endDate' 
            });
        }

        const [clipsData, bestPointsData] = await Promise.all([
            getClipsHistoryByClubAndTime(clubId, startDate, endDate),
            getBestPointsHistoryByClubAndTime(clubId, startDate, endDate)
        ]);

        res.json({
            clips: clipsData,
            bestPoints: bestPointsData
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};