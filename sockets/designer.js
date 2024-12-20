module.exports = (io, db) => {
    io.on('connect', (socket) => {
        console.log('Designer socket connected:', socket.id);
        socket.on('updateSocket', async (socketId, userId) => {
            try {
                const updateQuery = `UPDATE designerDetails SET socketId = ? WHERE id = ? AND userRole = 2`;
                const isUpdated =  await db.run(updateQuery, [socketId, userId]);
                if(isUpdated == 0) {
                console.log('Error: User not found');
                }
                else {
                    console.log('User updated successfully');
                }
               }
               catch (error) {
                    console.error('Error updating user:', error);
               }
        })
        socket.on('fetchDesignerDetails', async (designerId, callback) => {
                console.log('Fetching designer details for userId:', designerId);
            try {
                const designerDetailsQuery = `
                    SELECT * FROM designerDetails WHERE id = ? AND userRole = 2;
                `;
                const designerDetails = await db.get(designerDetailsQuery, [designerId]);
                if (designerDetails) {
                    console.log('Designer details fetched:', designerDetails);
                    callback({ success: true, designerDetails });
                } else {
                    console.log('No Designer Records found for userId:', designerId);
                    callback({ success: false, message: 'No Designer Records found' });
                }
            } catch (error) {
                console.error('Error fetching Designer Details:', error);
                callback({ success: false, error: error.message });
            }
        });
        socket.on('fetchDesignerPosts', async (designerId, callback) => {
            try {
                const query = `
              SELECT dp.*, dd.fullName, dd.userLogo
              FROM designerPost dp
              JOIN designerDetails dd ON dp.designerId = dd.id
              WHERE dp.designerId = ?
              ORDER BY dp.createdAt DESC
            `;
            const rows = await db.all(query, [designerId]);
                if (rows && rows.length > 0){  
                    callback({ success: true, posts: rows });
                } else {
                    console.log('Designer posts not found');
                    callback({ success: false, message: 'Designer posts not found' });
                }
            } catch (error) {
                console.error('Error fetching Designer Posts:', error);
                callback({ success: false, error: error.message });
            }
        });
        
        socket.on('disconnect', () => {
            console.log('Designer socket disconnected:', socket.id);
        });
    });
};
