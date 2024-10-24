const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { initializeDatabase } = require('./db');
const userRoutes = require('./routes/users');
const userSockets = require('./sockets/users');
const chatRoutes = require('./routes/chat');
const postRoutes = require('./routes/post');
const designerSockets = require('./sockets/designer');
const { instrument } = require('@socket.io/admin-ui');
const PORT = process.env.PORT || 5000;
const app = express();

const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:8081', 'http://127.0.0.1:8081', 'https://admin.socket.io', 'http://192.168.1.17:8081'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

instrument(io, {
    auth: false,
    mode: 'development'
});

const serverAddress = '0.0.0.0'; // Changed from '127.0.0.1' to '0.0.0.0'
const corsOptions = {
    origin: ['http://localhost:8081', 'http://127.0.0.1:8081', 'https://admin.socket.io', 'http://192.168.1.17:8081'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(express.json());
let db = null;
async function startServer() {
    try {
        db = await initializeDatabase();
        app.use('/users', userRoutes(db));
        app.use('/chat', chatRoutes(db));
        app.use('/post', postRoutes(db));
        userSockets(io, db); // Make sure this line is present and correct
        designerSockets(io, db);
        server.listen(PORT, serverAddress, () => {
            console.log(`Server is running on http://${serverAddress}:${PORT}`);
            console.log(`Socket.IO Admin UI available at https://admin.socket.io`);
            console.log(`Connect to Admin UI using: http://${serverAddress}:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/pdf', express.static(path.join(__dirname, 'pdf')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/feedUploads', express.static(path.join(__dirname, 'feedUploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.json({
        message: 'Rushi PC Server',
        server: serverAddress,
        port: PORT,
    });
});