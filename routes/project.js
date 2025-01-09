import express from 'express'; // Import Express
const router = express.Router();

export default (db) => {
        router.get('/fetchServices/:projectId', async (req, res) => {
        const projectId = req.params.projectId;
        const query = `
        SELECT ps.serviceId, s.serviceName, ps.createdAt, (COUNT(ps.serviceId)-1) * 25 AS percentage 
        FROM vendorServices s LEFT JOIN projectServices ps 
        WHERE s.servicesId = ps.serviceId AND ps.projectId = ? 
        GROUP BY ps.serviceId 
        ORDER BY ps.serviceId 
        `
        try {
            const services = await db.all(query, [projectId]);
            if (services.length > 0) {
                res.json({ success: true, services });
            } else {
                res.status(404).json({ success: false, message: 'No services found' });
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
        });
        router.get('/fetchServiceStatus/:serviceId', async (req, res) => {
            const serviceId = req.params.serviceId;
            const query = `
                SELECT *
                FROM projectServices ps
                WHERE serviceId = ? AND id NOT IN (
                    SELECT id
                    FROM projectServices
                    WHERE serviceId = ps.serviceId
                    ORDER BY createdAt
                    LIMIT 1
                );
            `
            try {
                const services = await db.all(query, [serviceId]);
                if (services.length > 0) {
                    res.json({ success: true, services });
                } else {
                    res.status(404).json({ success: false, services: [] });
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
        router.get('/fetchProjectByUserId/:userId', async (req,res) => {
            const userId = req.params.userId;
            const query = `
           WITH tasks AS (
                SELECT COUNT(*) AS completed, COUNT(DISTINCT ps.serviceId) * 5 AS totalTasks, p.name as projectTitle, p.thumbnail as thumbnail, p.projectId as projectId
                FROM projectServices ps LEFT JOIN projects p 
                ON p.projectId = ps.projectId 
                WHERE p.status = 'Ongoing' AND p.userId = ?
            )
            SELECT CAST(ROUND((completed * 1.0 / totalTasks) * 100, 0) AS INTEGER) as percentage, projectTitle, thumbnail, projectId FROM tasks 	 
            `
            try {
                const projects = await db.all(query, [userId]);
                res.json({ success: true, projects });
            } catch (error) {
                console.error('Error fetching projects:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        })
        router.get('/fetchProjectByProjectId/:projectId', async (req,res) => {
            const projectId = req.params.projectId;
            const query = `
           WITH tasks AS (
                SELECT COUNT(*) AS completed, COUNT(DISTINCT ps.serviceId) * 5 AS totalTasks, p.name as projectTitle, p.thumbnail as thumbnail, p.projectId as projectId
                FROM projectServices ps LEFT JOIN projects p 
                ON p.projectId = ps.projectId 
                WHERE p.projectId = ?
            )
            SELECT CAST(ROUND((completed * 1.0 / totalTasks) * 100, 0) AS INTEGER) as percentage, projectTitle, thumbnail, projectId FROM tasks 
            `
            try {
                const projects = await db.all(query, [projectId]);
                res.json({ success: true, projects });
            } catch (error) {
                console.error('Error fetching projects:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        })
        router.get('/fetchProjectUpdate/:userId', async (req,res) => {
            const userId = req.params.userId;
            const query = `
            SELECT ps.*
            FROM projectServices ps
            JOIN projects p ON ps.projectId = p.projectId
            WHERE p.userId = ?
            AND p.status = 'Ongoing'  
            AND ps.id NOT IN (
                SELECT id
                FROM projectServices
                WHERE projectId IN (
                    SELECT projectId
                    FROM projects
                    WHERE userId = ? AND status = 'Ongoing'
                )
                AND serviceId = ps.serviceId
                ORDER BY createdAt
                LIMIT 1
            )
            ORDER BY ps.createdAt;
            `
            try {
                const projects = await db.all(query, [userId, userId]);
                res.json({ success: true, projects });
            } catch (error) {
                console.error('Error fetching projects:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        })
        router.post('/reviews', async (req, res) => {
            try {
                const { user_name, user_image, rating, comment } = req.body;
        
                await db.run(`
                    INSERT INTO reviews (user_name, user_image, rating, comment, reviewed_at)
                    VALUES (?, ?, ?, ?,?);
                `, [user_name, user_image, rating, comment, Date.now()]);
        
                res.send({ message: 'Review added successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).send({ message: 'Error adding review' });
            }
        });
        
        router.get('/reviews', (req, res) => {
            db.all('SELECT * FROM reviews', (err, rows) => {
                if (err) {
                    res.status(500).send({ message: 'Error fetching reviews' });
                } else {
                    res.send(rows);
                }
            });
        });
        return router;
}