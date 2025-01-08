import express from 'express';
const router = express.Router();

export default (db) => {
    
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
                commentId: row.commentId,
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
        const getPost  = `
        SELECT * FROM designerPost WHERE postId = ?;
        `;
        try {
            const posts = await db.get(getPost,[postId]);
            res.status(201).json( posts );
        } catch(error) {
            console.error(`Error adding Comment: `, error);
            res.status(500).json({status: false, message: " Internal Server Error"})
        }
    })

    router.get('/fetchCommentLikes/:postId/:commentId/:userId', async (req, res) => {
        const postId = req.params.postId;
        const userId = req.params.userId;
        const commentId = req.params.commentId;
      
        const checkQuery = `
        SELECT 
            CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM commentLikes AS cl 
                    WHERE cl.commentId = ? AND cl.postId = ? AND cl.userId = ? 
                ) THEN 'Liked'
                ELSE 'Not Liked'
            END AS likeStatus;
        `
        try {
          const commentLikes = await db.all(checkQuery, [commentId, postId, userId]);
          if (commentLikes.length > 0) {
            res.status(201).json({ success: true, commentLikes })
          } else {
            res.status(201).json({ success: false, message: "no users liked this comment" });
          }
        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error });
        }
      })
    

      router.post('/likeComment', async (req, res) => {
        const postId = req.body.postId;
        const userId = req.body.userId;
        const commentId = req.body.commentId;
      
        const checkQuery = `
        SELECT 
            CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM commentLikes AS cl 
                    WHERE cl.commentId = ? AND cl.postId = ? AND cl.userId = ? 
                ) THEN 'Liked'
                ELSE 'Not Liked'
            END AS likeStatus;
        `
      
        try {
          const commentLikes = await db.all(checkQuery, [commentId, postId, userId]);
      
          if (commentLikes[0].likeStatus === 'Liked') {
            // Unlike the comment
            const unlikeQuery = `
            DELETE FROM commentLikes 
            WHERE commentId = ? AND postId = ? AND userId = ?;
            `
            await db.run(unlikeQuery, [commentId, postId, userId]);
            res.status(201).json({ success: true, likeStatus: 'Not Liked' });
          } else {
            // Like the comment
            const likeQuery = `
            INSERT INTO commentLikes (commentId, postId, userId) 
            VALUES (?, ?, ?);
            `
            await db.run(likeQuery, [commentId, postId, userId]);
            res.status(201).json({ success: true, likeStatus: 'Liked' });
          }
        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error });
        }
      })
      
    return router;
}
