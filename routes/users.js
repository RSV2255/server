const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ensure the uploads directory exists
const ensureImageDirectoryExists = () => {
    const dir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

module.exports = (db) => {
    router.post('/register', async (req, res) => {
        const { socketId, fullName, email, mobileNumber } = req.body;
    
        if (!fullName || !email || !mobileNumber) {
            return res.status(400).json({ error: 'Full name, email, and mobile number are required' });
        }
        try {
            const selectQuery = `SELECT * FROM userDetails WHERE mobileNumber = ? OR email = ?`;
            const existingUser = await db.get(selectQuery, [mobileNumber, email]);
    
            if (existingUser) {
                res.status(409).json ({status: true ,  message : 'User already exists with the same mobile number or email' });
                return;
            }
            else {
            const insertQuery = `
            INSERT INTO userDetails (socketId, fullName, email, mobileNumber, userRole) 
            VALUES (?, ?, ?, ?, ?)
            `;
            await db.run(insertQuery, [socketId, fullName, email, mobileNumber, 1]);
            res.json({ status: false ,message: 'User registered successfully', socketId });
            }
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/login', async (req,res) => {
        const {phoneNumber} = req.body;
        const selectquery = 
        `
        SELECT DISTINCT *
    FROM "userDetails"
    WHERE mobileNumber = ?
        `;
        const user = await db.get(selectquery, [phoneNumber]);
        if (!user) {
            res.status(400).json({
                Status: "User does not exist",
            })
        }
        else {
            const userName = user.fullName;
            const userId = user.id;
            const userRole = user.userRole;
            const userLogo = user.userLogo;
            console.log(userLogo);
           res.json({
            Status: "User exists",
            userName: userName,
            userId: userId,
            userRole: userRole,
            userLogo: userLogo,
           })
        }
    })
    router.get('/userDetails/:userId', async (req,res) => {
        const userId = req.params.userId;
        try {
            const userDetailsQuery = `
        SELECT * FROM userDetails WHERE id = ? AND userRole = 1;
        `
            const userDetails = await db.get(userDetailsQuery, [userId]);
            if (userDetails) {
                console.log(userDetails);
                res.json(userDetails);
            } else {
                console.log('No User Records found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: "Internal server error" });
        }
    })
    router.put('/updateUserDetails/:userId', async (req,res) => {
        const userId = req.params.userId;
        try {
            const { fullName, email, mobileNumber, gender, userLogo } = req.body;
            const updateUserDetails = `
            UPDATE userDetails SET fullName = ?, email = ?, mobileNumber = ?, gender = ?, userLogo = ? WHERE id = ?;
            `;
            await db.run(updateUserDetails, [fullName, email, mobileNumber, gender, userLogo, userId]);
            res.status(200).json({ status: true, message: 'User details updated successfully' });
        } catch (error) {
            console.error('Error updating user details:', error);
            res.status(500).json({ status: false, message: 'Internal server error' });
        }
    })
    router.post('/upload-image', (req, res) => {
        console.log(req.body);
        ensureImageDirectoryExists();
        const { image, fileName, extension } = req.body;
    
        const buffer = Buffer.from(image, 'base64');
        const filePath = path.join(__dirname, '..', 'images', `${fileName}.${extension}`);
    
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error saving image file: ', err);
                return res.status(500).send({ error: 'Error saving image file' });
            }
            console.log('Image saved successfully');
            res.json({ imageUrl: `images/${fileName}.${extension}` });
        });
    });
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
    router.post('/propertyRegister', async (req, res) => {
        const { userId, property, minBudget, maxBudget, propertySize, propertySizeUnits, startDate, endDate, projectType, selectedProperty, occupancy, area, city, community, buildersProject, unitType } = req.body;

        const insertStatement = `
        INSERT INTO property_details (
            userId, propertyType, projectType, property, occupancy, area, city, community, buildersProject, unitType, minBudget, maxBudget, propertySize, propertySizeUnits, startDate, endDate
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ;
        `;
        try {
            console.log('Attempting to insert project details:', req.body);
            const result = await db.run(insertStatement, [
                userId,
                property,
                projectType,
                selectedProperty || null,
                occupancy || null,
                area || null,
                city || null,
                community || null,
                buildersProject || null,
                unitType || null,
                minBudget,
                maxBudget,
                propertySize,
                propertySizeUnits,
                startDate,
                endDate
            ]);

            console.log('Insert result:', result);

            if (result.changes > 0) {
                res.status(201).json({ status: true, message: 'Project Registered Successfully', projectId: result.lastID });
            } else {
                res.status(400).json({ status: false, message: 'Failed to register project' });
            }
        } catch (error) {
            console.error('Error registering project:', error);
            res.status(500).json({ status: false, error: 'Error registering project', details: error.message });
        }
    });
    router.get('/fetchProject/:projectId', async (req,res) => {
        const projectId = req.params.projectId;
        const fetchProjectList = `SELECT * FROM projects WHERE projectId = ?;`;
        try {
            const rows = await db.get(fetchProjectList, [projectId]);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching project list:', error);
            res.status(500).json({ status: false, error: 'Error fetching project list', details: error.message });
        }
    })

return router;
};