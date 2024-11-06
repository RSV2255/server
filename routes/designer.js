const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Fetch all designers
    router.get('/fetchAllDesigners', async (req, res) => {
        const fetchDesignersQuery = `
SELECT 
    ROW_NUMBER() OVER (ORDER BY id) AS unique_id,
    id,
    fullName,
    email,
    mobileNumber,
    userRole,
    userLogo
FROM (
    SELECT id, fullName, email, mobileNumber, userRole, userLogo FROM designerDetails 
    UNION ALL
    SELECT id, fullName, email, mobileNumber, userRole, userLogo FROM userDetails
)
        `;
        try {
            const designers = await db.all(fetchDesignersQuery);
            if (designers.length > 0) {
                res.json({ success: true, designers });
            } else {
                res.status(404).json({ success: false, message: 'No designers found' });
            }
        } catch (error) {
            console.error('Error fetching designers:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
    return router;
};
