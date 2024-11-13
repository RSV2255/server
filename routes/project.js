const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

module.exports = (db) => {
       router.get('/fetchServices/:projectId', (req, res) => {
        const projectId = req.params.projectId;
        const services = db.query('SELECT * FROM projectServices WHERE projectId = ?', [projectId]);
        res.json(services);
       });

       return router;
}