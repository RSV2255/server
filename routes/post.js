const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/fetchComments/:postId', async (req,res) => {
        const postId = req.params.postId;
        const getComments = `
        SELECT * FROM comments WHERE postSId = ?;
        `;
        try {
            const rows = await db.all(getComments,[postId]);
            if (rows.length === 0) {
                return res.status(404).json({ message: "No Comments Found" });
            }
            const formattedComment = rows.map(row => ({
                postId: row.postSId,
                designerId: row.designerId,
                comment: row.comment,
                userName: row.userName,
                createdAt: row.createdAt,
                logo: row.userLogo,
            }))
            res.json(formattedComment);
        } catch(error) {
            console.error('Error fetching comments: ', error);
            res.status(500).json({ message: "Internal server error" });
        }
    })

    router.post('/addComment', async (req,res) => {
        const { postId, designerId, comment, userName, userLogo } = req.body;
        const addComment = `
        INSERT INTO comments (postSId, designerId, comment, userName, userLogo, createdAt)
        VALUES (?, ?, ?, ?, ?, ?);
        `;
        try {
            await db.run(addComment,[postId, designerId, comment, userName, userLogo, Date.now()]);
            res.status(201).json({status: true, message: 'comment Added Successfully'});
        } catch (error) {
            console.error('Error adding comment: ', error);
            res.status(500).json({ status: false, message: "Internal server error" });
        }
    })

    router.get('/fetchPostDetails/:postId', async (req,res) => {
        const postId = req.params.postId;
        const getPost  =`
        SELECT * FROM designerPost WHERE postId = ?;
        `;
        try {
            const posts = await db.get(getPost,[postId]);
            res.status(201).json( posts )
        } catch(error) {
            console.error(`Error adding Comment: `, error);
            res.status(500).json({status: false, message: " Internal Server Error"})
        }
    })
    
    return router;
}
