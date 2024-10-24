const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./db');
const userRoutes = require('./routes/users');
const userSockets = require('./sockets/users');

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:8081',  'http://127.0.0.1:8081'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true 
    }
});

const serverAddress = '127.0.0.1';
const corsOptions = {
    origin: ['http://localhost:8081', 'http://127.0.0.1:8081'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json({limit: '100mb'}));
app.use(express.json());

async function startServer() {
    try {
        const db = await initializeDatabase();
        
        // Use the user routes
        app.use('/api/users', userRoutes(db, io));

        // Initialize user sockets
        userSockets(io, db);

        // ... (other route initializations)

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// ... (rest of your server.js code)

module.exports = { io };