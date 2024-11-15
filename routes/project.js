const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();


module.exports = (db) => {
       router.get('/fetchServices/:projectId', async (req, res) => {
        const projectId = req.params.projectId;
        try {
            const services = await db.all('SELECT * FROM projectServices WHERE projectId = ?', [projectId]);
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
       return router;
}