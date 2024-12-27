import express from 'express'; // Import Express
import bodyParser from 'body-parser'; 
import http from 'http'; // Import HTTP module
import path from 'path'; // Import Path module
import cors from 'cors'; // Import CORS
import { Server } from 'socket.io'; // Import Socket.IO
import { fileURLToPath } from 'url'; // Import for getting __filename
import { dirname } from 'path'; 
import { instrument } from '@socket.io/admin-ui'; 
import  initializeDatabase  from './db.js'; 
import userRoutes from './routes/users.js'; 
import chatRoutes from './routes/chat.js'; // Import chat routes
import postRoutes from './routes/post.js'; // Import post routes
import projectRoutes from './routes/project.js'; // Import project routes
import designerRoutes from './routes/designer.js'; // Import designer routes
import userSockets from './sockets/users.js'; // Import user socket handlers
import designerSockets from './sockets/designer.js'; // Import designer socket handlers
import smsotpRoutes from './routes/smsotp.js'; // Import SMS OTP routes

// Additional application setup and server initialization code would go here...

const PORT = process.env.PORT || 5000;
const app = express();

const __filename = fileURLToPath(import.meta.url); // Get current file path
const __dirname = dirname(__filename); // Get directory name from file path

const server = http.createServer(app);

const io = new Server(server, {
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
        app.use('/project', projectRoutes(db));
        app.use('/designer', designerRoutes(db));
        app.use('/OTP', smsotpRoutes());
        userSockets(io, db);
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
// app.use('/videos', express.static(path.join(__dirname, 'videos')));
// app.use('/pdf', express.static(path.join(__dirname, 'pdf')));
// app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use('/feedUploads', express.static(path.join(__dirname, 'feedUploads')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from multiple directories
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