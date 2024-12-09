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
    router.get('/fetchFollowStatus/:userId/:designerId', async (req, res) => {
        const userId = req.params.userId;
        const designerId = req.params.designerId;

        const checkFollow = `
        SELECT * FROM follows WHERE followingId = ? AND followerId = ?;
        `;
        try {
            const followStatus = await db.get(checkFollow, [userId, designerId]);
            if (followStatus) {
                res.json({ success: true, followStatus, isFollow: true });
            } else {
                res.json({ success: true, message: 'No designers found', isFollow: false });
            }
        } catch(error) {
            console.error('Error Checking Follows:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    })

    router.post('/toggleFollowStatus/:userId/:designerId', async (req, res) => {
        const userId = req.params.userId;
        const designerId = req.params.designerId;
        const checkFollow = `
        SELECT * FROM follows WHERE followingId = ? AND followerId = ?;
        `;
        const unFollow = `
        DELETE FROM follows WHERE followingId = ? AND followerId = ?;
        `;
        const Follow = `
        INSERT INTO follows (followingId, followerId, createdAt) VALUES (?,?, ${Date.now()});
        `;
        try {
            const check = await db.get(checkFollow, [userId, designerId]);
            if (check) {
                await db.run(unFollow, [userId, designerId]);
                console.log('Unfollowed:', userId, designerId);
                return res.json({ success: true, message: 'Unfollowed successfully', isFollow: false });
            } else {
                await db.run(Follow ,[userId, designerId]);
                console.log('Followed:', userId, designerId);
                return res.json({ success: true, message: 'Followed successfully', isFollow: true });
            }
        } catch(error) {
            console.error('Error Updating Follows:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    })
    
    return router;
};
