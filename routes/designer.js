const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Fetch all designers
    router.get('/fetchDesignerdetails/:designerId', async (req, res) => {
        const designerId = req.params.designerId;
        const fetchDesignerDetailsQuery = `
            SELECT * FROM designerDetails WHERE id = ? AND userRole = 2;
        `;
        try {
            const designerDetails = await db.get(fetchDesignerDetailsQuery, [designerId]);
            if (designerDetails) {
                res.json({ success: true, designerDetails });
            } else {
                res.status(404).json({ success: false, message: 'No designer details found' });
            }
        }
        catch (error) {
            console.error('Error fetching designer details:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    })
    
    router.get('/fetchAllDesigners', async (req, res) => {
        const fetchDesignersQuery = `
        SELECT 
            ROW_NUMBER() OVER (ORDER BY id) AS row_id,
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
