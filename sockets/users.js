export default (io, db) => {
    io.on('connect', (socket) => {
        console.log(`Client connected with ${socket.id}`);
        //updating the socketId for user in the database
        socket.on('updateSocket', async(socketId, userId) => {
                try {
                    const updateQuery = `UPDATE userDetails SET socketId = ? WHERE id = ? AND userRole = 1`;
                    const isUpdated = await db.run(updateQuery, [socketId, userId]);
                    if (isUpdated == 0) {
                        console.log('Error: User not found');
                    } else {
                        console.log('User updated successfully');
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                }
            })
        socket.on('fetch-feedDetails', async( userId, callback ) => {
                try {
                    const feedDetailsQuery = `
                SELECT *
                FROM designerPost
                ORDER BY
                    CASE
                        WHEN catalog IN (SELECT catalogId FROM user_catalogs WHERE userId = ?) THEN 0
                        ELSE 1
                    END,
                createdAt DESC;
                `
                    const feedDetails = await db.all(feedDetailsQuery, [userId]);
                    if (!feedDetails) {
                        console.log('Error: Feed details not found');
                        callback({ success: false, message: 'Feed details not found' });
                    } else {
                        console.log('Feed details fetched successfully');
                        callback({ success: true, feedDetails });
                    }
                } catch (error) {
                    console.error('Error fetching feed details:', error);
                }
            })
        // fetching the project details from the database
        socket.on('fetchProjectList', async(userId, response) => {
                try {
                    const projectListQuery = `
                SELECT * FROM projects WHERE userId = ?; 
                `;
                    const projectList = await db.all(projectListQuery, [userId]);
                    if (projectList) {
                        console.log(projectList)
                        response({ projectList });
                    } else {
                        response([]);
                    }
                } catch (error) {
                    console.error(error);
                }
            })

        socket.on('fetchLikedFeed', async(userId, callback) => {
            console.log('Fetching liked feed for userId:', userId);
            try {
                const likedFeedQuery = `
                SELECT feed.* FROM likes like INNER JOIN designerPost feed ON feed.postId = like.postId WHERE userId = ?;
                `;
                const likedFeed = await db.all(likedFeedQuery, [userId]);
                console.log('Fetched likedFeed:', likedFeed);
                if (!likedFeed || likedFeed.length === 0) {
                    console.error(`No liked feed found for userId: ${userId}`);
                    callback({ success: false });
                } else {
                    console.log('LikedFeed:', likedFeed);
                    callback({ success: true, likedFeed });
                }
            } catch (error) {
                console.error('Error fetching liked feed:', error);
                callback({ success: false, error: error.message });
            }
        });
        // fetching the saved feed from the database
        socket.on('fetchSavedFeed', async(userId, callback) => {
            console.log('Fetching saved feed for userId:', userId);
            try {
                const savedFeedQuery = `
                    SELECT feed.* from designerPost feed INNER JOIN savedPosts saved on feed.postId = saved.postId where saved.userId = ?
                `;
                const savedFeed = await db.all(savedFeedQuery, [userId]);
                console.log('Fetched Saved Feed: ', savedFeed);
                if (!savedFeed || savedFeed.length === 0) {
                    console.error(`No saved feed found for userId: ${userId}`);
                    callback({ success: false });
                } else {
                    console.log('Saved Feed:', savedFeed);
                    callback({ success: true, savedFeed });
                }
            } catch (error) {
                console.error('Error fetching saved feed:', error);
                callback({ success: false, error: error.message });
            }

        });
        // fetching the chatlist from the database
        socket.on('fetchChatlist', async(userId, callback) => {
            try {
                const chatlistQuery = `
                                        WITH LatestMessages AS (
                        SELECT
                            CASE 
                                WHEN userId = ? THEN otherUserId
                                ELSE userId
                            END AS partnerUserId,
                            MAX(createAt) AS latestCreateAt
                        FROM chat
                        WHERE (userId = ? OR otherUserId = ?) AND (userId != otherUserId OR userName != otherUserName)
                        GROUP BY partnerUserId
                    )
                    SELECT c.*,
					CASE 
						WHEN c.userRole = 1 
						THEN (SELECT userLogo FROM userDetails WHERE id = c.userId)
						WHEN c.userRole = 2
						THEN (SELECT userLogo FROM designerDetails WHERE id = c.userId)
					END AS userLogo,
					CASE 
						WHEN c.otherUserRole = 1 
						THEN (SELECT userLogo FROM userDetails WHERE id = c.otherUserId)
						WHEN c.otherUserRole = 2
						THEN (SELECT userLogo FROM designerDetails WHERE id = c.otherUserId)
					END AS otherUserLogo
                    FROM chat c
                    JOIN LatestMessages lm
                        ON ((c.userId = ? AND c.otherUserId = lm.partnerUserId)
                            OR (c.userId = lm.partnerUserId AND c.otherUserId = ?))
                        AND c.createAt = lm.latestCreateAt
                    ORDER BY c.createAt DESC;
                `;

                const chatlist = await db.all(chatlistQuery, [userId, userId, userId, userId, userId]);

                console.log('Fetched chatlist:', chatlist); 

                if (!chatlist || chatlist.length === 0) {
                    console.log('No chatlist found for userId:', userId);
                    callback({ success: false, message: 'No chatlist found' });
                } else {
                    console.log(`Chatlist fetched successfully for userId: ${userId}. Count: ${chatlist.length}`);
                    callback({ success: true, chatlist });
                }
            } catch (error) {
                console.error('Error fetching chatlist:', error);
                callback({ success: false, message: 'Error fetching chatlist', error });
            }
        });

        // fetching the messages from the database
        socket.on('fetchMessages', async(userId, otherUserId, ) => {
                try {
                    const selectQuery = `
                SELECT * FROM chat WHERE ((userId = ? AND otherUserId = ?) OR (otherUserId = ? and userId = ?)) 
                `
                    const messages = await db.all(selectQuery, [userId, otherUserId, userId, otherUserId]);
                    if (!messages) {
                        console.log('Error: Messages not found');
                    } else {
                        console.log('Messages fetched successfully');
                        console.log(messages)
                        socket.emit('messages', messages);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            })
            // fetching the likes from the database
        socket.on('fetchLikes', async(callback) => {
            try {
                const fetchLikesQuery = `
                    SELECT postId, userId FROM likes;
                `;
                const likes = await db.all(fetchLikesQuery);
                if (!likes) {
                    console.log('Error: Likes not found');
                    callback({ success: false, message: 'Likes not found' });
                } else {
                    console.log('Likes fetched successfully');
                    callback({ success: true, likes });
                }
            } catch (error) {
                console.log('Error at Fetching Likes ', error);
            }
        });
        // fetching the total likes from the database
        socket.on('fetchTotalLikes', async(callback) => {
                try {
                    const query = `SELECT postId, count(userId) AS totalLikes from likes GROUP BY postId`
                    const likesCount = await db.all(query);
                    if (!likesCount) {
                        console.log('Error: Likes not found');
                        callback({ success: false, message: 'Likes not found' });
                    } else {
                        console.log('TotalLikes fetched successfully');
                        callback({ success: true, likesCount });
                    }
                } catch (error) {
                    console.log('Error at Fetching Total Likes ', error);
                }
            })
            // liking the post
        socket.on('likePost', async({ postId, userId }, callback) => {
            try {
                const likedPostInsertStatement = `
              INSERT INTO likes(postId, userId, createdAt)
              VALUES (?, ?, ?);
            `;
                await db.run('BEGIN TRANSACTION');
                await db.run(likedPostInsertStatement, [postId, userId, Date.now()]);
                await db.run('COMMIT');

                // Fetch the updated likes count
                const likesCountQuery = `SELECT COUNT(*) as count FROM likes WHERE postId = ?`;
                const result = await db.get(likesCountQuery, [postId]);
                const updatedLikesCount = result.count;

                console.log('Post liked');
                callback({ success: true, liked: true, likesCount: updatedLikesCount });
                io.emit('likeUpdate', { postId, userId, liked: true, likesCount: updatedLikesCount });
            } catch (error) {
                await db.run('ROLLBACK');
                console.log('Error at liking post', error);
                callback({ success: false, error: 'Error liking post' });
            }
        });
        // unliking the post
        socket.on('unlikePost', async({ postId, userId }, callback) => {
            try {
                const unlikedPostDeleteStatement = `
                    DELETE FROM likes WHERE postId = ? AND userId = ?;
                `;
                await db.run('BEGIN TRANSACTION');
                await db.run(unlikedPostDeleteStatement, [postId, userId]);
                await db.run('COMMIT');
                console.log('Post unliked successfully');
                io.emit('likeUpdate', { postId, userId, liked: false }); // Include liked status
                callback({ success: true, liked: false, message: 'Post unliked successfully' });
            } catch (error) {
                await db.run('ROLLBACK');
                console.log('Error at unliking post', error);
                callback({ success: false, error: 'Error unliking post' });
            }
        });

        // fetching the saved posts from the database
        socket.on('fetchSaved', async(callback) => {
            try {
                const fetchSavedQuery = `
                SELECT postId, userId FROM savedPosts;
              `;
                const savedPosts = await db.all(fetchSavedQuery);
                if (!savedPosts) {
                    console.log('Error: savedPosts not found');
                    callback({ success: false, message: 'savedPosts not found' });
                } else {
                    console.log('savedPosts fetched successfully');
                    callback({ success: true, savedPosts });
                }
            } catch (error) {
                console.log('Error at Fetching savedPosts ', error);
                callback({ success: false, error: error.message });
            }
        });

        // saving the post
        socket.on('savePost', async({ postId, userId }, callback) => {
                try {
                    const savedPostInsertStatement = `
                    INSERT INTO savedPosts(postId, userId, createdAt)
                    VALUES (?, ?, ?);
                `;
                    await db.run('BEGIN TRANSACTION');
                    await db.run(savedPostInsertStatement, [postId, userId, Date.now()]);
                    await db.run('COMMIT');
                    console.log('Post Saved');
                    callback({ success: true, saved: true });
                    io.emit('saveUpdate', { postId, userId, saved: true }); // Include saved status
                } catch (error) {
                    await db.run('ROLLBACK');
                    console.log('Error at Liking Post', error);
                    callback({ success: false, error: 'Error saving post' });

                }
            })
            // un-saving the post
        socket.on('unsavePost', async({ postId, userId }, callback) => {
                try {
                    const unsavedPostDeleteStatement = `
                    DELETE FROM savedPosts WHERE postId = ? AND userID = ?;
                `
                    await db.run('BEGIN TRANSACTION');
                    await db.run(unsavedPostDeleteStatement, [postId, userId]);
                    await db.run('COMMIT');
                    console.log('Post Unsaved');
                    io.emit('saveUpdate', { postId, userId, saved: false });
                    callback({ success: true, saved: false });
                } catch (error) {
                    await db.run('ROLLBACK');
                    console.log('Error at Unliking Post', error);
                    callback({ success: false, error: 'Error unsaving post' });
                }
            })
            // finding the socketId by userId
        async function findSocketIdByUserId(userId) {
            try {
                const selectQuery = `SELECT socketId FROM userDetails WHERE id = ?`;
                const result = await db.get(selectQuery, [userId]);
                return result ? result.socketId : null;
            } catch (error) {
                console.error('Error finding socket ID:', error);
                return null;
            }
        }
        // sending the text message
        socket.on('sendText', async(text, userId, userName, userRole, otherUserId, otherUserName, otherUserRole) => {
            try {
                await db.run('BEGIN TRANSACTION');

                const insertQuery = `
                    INSERT INTO chat (userId, userName, userRole, text, createAt, otherUserId, otherUserName, systemMessage, otherUserRole)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await db.run(insertQuery, [userId, userName, userRole, text, Math.floor(Date.now()), otherUserId, otherUserName, 'false', otherUserRole]);
                await db.run('COMMIT');

                const selectQuery = `
                    SELECT * FROM chat WHERE (userId = ? AND otherUserId = ?) OR (otherUserId = ? AND userId = ?) ORDER BY createAt DESC LIMIT 1
                `;
                const message = await db.get(selectQuery, [otherUserId, userId, otherUserId, userId]);
                if (!message) {
                    console.log('Error: Message not found');
                } else {
                    console.log('Message added successfully');
                    // Find recipient's socket ID and emit the message
                    const recipientSocket = await findSocketIdByUserId(otherUserId);
                    if (recipientSocket) {
                        io.to(recipientSocket).emit('received-message', message);
                    } else {
                        console.log(`Socket ID not found for user ${otherUserId}`);
                    }

                    // Emit the message back to the sender
                    io.to(socket.id).emit('received-message', message);
                }
            } catch (error) {
                console.error('Error adding messages:', error);
                await db.run('ROLLBACK'); // Rollback transaction on error
            }
        });
        socket.on('sendImage', async(data) => {
            try {
                await db.run('BEGIN TRANSACTION');

                const insertQuery = `
                    INSERT INTO chat (userId, userName, userRole, image, resolution, createAt, otherUserId, otherUserName, systemMessage, otherUserRole)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await db.run(insertQuery, [data.userId, data.userName, data.userRole, data.image, data.resolution, Math.floor(Date.now()), data.otherUserId, data.otherUserName, 'false', data.otherUserRole]);
                await db.run('COMMIT');

                const selectQuery = `
                    SELECT * FROM chat WHERE (userId = ? AND otherUserId = ?) OR (otherUserId = ? AND userId = ?) ORDER BY createAt DESC LIMIT 1
                `;
                const message = await db.get(selectQuery, [data.otherUserId, data.userId, data.otherUserId, data.userId]);

                if (!message) {
                    console.log('Error: Message not found');
                } else {
                    console.log('Image message added successfully');
                    const recipientSocket = await findSocketIdByUserId(data.otherUserId);
                    if (recipientSocket) {
                        io.to(recipientSocket).emit('received-image', message);
                    } else {
                        console.log(`Socket ID not found for user ${data.otherUserId}`);
                    }
                    // Emit the image back to the sender
                    io.to(socket.id).emit('received-image', message);
                }
            } catch (error) {
                console.error('Error adding image messages:', error);
                await db.run('ROLLBACK'); // Rollback transaction on error
            }
        });
        socket.on('sendVideo', async(data) => {

            console.log(data);
            try {

                await db.run('BEGIN TRANSACTION');
                const insertQuery = `
                    INSERT INTO chat (userId, userName, userRole, video, resolution,createAt, otherUserId, otherUserName, systemMessage, otherUserRole)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await db.run(insertQuery, [data.userId, data.userName, data.userRole, data.video, data.resolution, Date.now(), data.otherUserId, data.otherUserName, 'false', data.otherUserRole]);
                await db.run('COMMIT');

                const selectQuery = `
                    SELECT * FROM chat WHERE (userId = ? AND otherUserId = ?) OR (otherUserId = ? AND userId = ?) ORDER BY createAt DESC LIMIT 1
                `;
                const message = await db.get(selectQuery, [data.otherUserId, data.userId, data.otherUserId, data.userId]);
                if (!message) {
                    console.log('Error: Message not found');
                } else { 
                    console.log('Video message added successfully');
                    const recipientSocket = await findSocketIdByUserId(data.otherUserId);
                    if (recipientSocket) {
                        io.to(recipientSocket).emit('received-video', message);
                    } else {
                        console.log(`Socket ID not found for user ${data.otherUserId}`);
                    }
                    io.to(socket.id).emit('received-video', message);
                }
            } catch (error) {
                console.error('Error adding video messages:', error);
                await db.run('ROLLBACK'); // Rollback transaction on error
            }

        });
        socket.on('sendPdf', async(data) => {
            console.log(data);
            try {
                await db.run('BEGIN TRANSACTION');
                const insertQuery = `
                INSERT INTO chat (userId, userName, userRole, document, createAt, otherUserId, otherUserName, otherUserRole, systemMessage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;
                await db.run(insertQuery, [data.userId, data.userName, data.userRole, data.document, Date.now(), data.otherUserId, data.otherUserName, data.otherUserRole, 'false']);
                await db.run('COMMIT');
                const selectQuery = `
                    SELECT * FROM chat WHERE (userId = ? AND otherUserId = ?) OR (otherUserId = ? AND userId = ?) ORDER BY createAt DESC LIMIT 1
                `;
                const message = await db.get(selectQuery, [data.otherUserId, data.userId, data.otherUserId, data.userId]);
                if (!message) {
                    console.log('Error: Message not found');
                } else {
                    console.log('Pdf message added successfully');
                    const recipientSocket = await findSocketIdByUserId(data.otherUserId);
                    if (recipientSocket) {
                        io.to(recipientSocket).emit('received-pdf', message);
                    } else {
                        console.log(`Socket ID not found for user ${data.otherUserId}`);
                    }

                    io.to(socket.id).emit('received-pdf', message);
                }
            } catch (error) {
                await db.run('ROLLBACK');
                console.error('Error adding Pdf messages:', error);
            }
        })
        socket.on('requestPdf', (fileName) => {
            const filePath = path.join('pdf', fileName);

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    socket.emit('pdfError', 'Error reading file');
                    return;
                }
                const base64Data = data.toString('base64');
                socket.emit('pdfFile', { fileName, fileData: base64Data });
            });
        });

        socket.on('toggleFollowDesigner', async({ userId, designerId }, callback) => {
            try {
                const checkQuery = `SELECT * FROM follows WHERE followingId = ? AND followerId = ? AND followerUserRole = 2 AND followingUserRole = 1`;
                const existingFollow = await db.get(checkQuery, [userId, designerId]);

                if (existingFollow) {
                    // Unfollow
                    const deleteQuery = `DELETE FROM follows WHERE followingId = ? AND followerId = ? AND followerUserRole = 2 AND followingUserRole = 1`;
                    await db.run(deleteQuery, [userId, designerId]);
                    callback({ success: true, message: 'Unfollowed successfully', isFollowing: false });

                    const designerSocket = await findSocketIdByUserId(designerId);
                    if (designerSocket) {
                        io.to(designerSocket).emit('lostFollower', { followerId: userId });
                    }
                } else {
                    // Follow
                    const insertQuery = `INSERT INTO follows (followingId, followerId, createdAt, followerUserRole, followingUserRole) VALUES (?, ?, ?, ?, ?)`;
                    await db.run(insertQuery, [userId, designerId, Date.now(), 2, 1]);
                    callback({ success: true, message: 'Followed successfully', isFollowing: true });

                    // Notify the designer that they have a new follower
                    const designerSocket = await findSocketIdByUserId(designerId);
                    if (designerSocket) {
                        io.to(designerSocket).emit('newFollower', { followerId: userId });
                    }
                }
            } catch (error) {
                console.error('Error toggling follow status:', error);
                callback({ success: false, message: 'An error occurred while updating follow status', isFollowing: null });
            }
        });

        socket.on('fetchFollowStatus', async({ userId, designerId }, callback) => {
            try {
                const checkQuery = `SELECT * FROM follows WHERE followingId = ? AND followerId = ? AND followerUserRole = 2 AND followingUserRole = 1`;
                const existingFollow = await db.get(checkQuery, [userId, designerId]);

                callback({ success: true, isFollowing: !!existingFollow });
            } catch (error) {
                console.error('Error fetching follow status:', error);
                callback({ success: false, message: 'An error occurred while fetching follow status', isFollowing: null });
            }
        });
        socket.on('disconnect', () => {
            console.log(`Client disconnected with ${socket.id}`);
        });
    });
};