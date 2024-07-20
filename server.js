const { instrument } = require('@socket.io/admin-ui');
const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();

const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:8081', 'https://admin.socket.io', 'http://127.0.0.1:8081'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true  // Allow credentials (cookies, tokens)
    }
});

const serverAddress = '192.168.1.10';
const corsOptions = {
    origin: ['http://localhost:8081', 'https://admin.socket.io', 'http://127.0.0.1:8081'],
    credentials: true  
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
const dbPath = path.join(__dirname, './data/my-database.db');
let db = null;
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        console.log('Connected to the SQLite database.');
        
        server.listen(PORT, () => {
            console.log(`Server is running at http://${serverAddress}:${PORT}/`);
        });

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};
initializeDBAndServer();

app.use(bodyParser.json());
io.on('connect', (socket) => {
    console.log(`Client connected with ${socket.id}`);
    socket.on('updateSocket', async (socketId, userId) => {
        try {
            const updateQuery = `UPDATE userDetails SET socketId = ? WHERE id = ?`;
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
    socket.on('fetchChatlist', async (userId) => {
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
                    WHERE (userId = ? OR otherUserId = ?) AND userId != otherUserId
                    GROUP BY partnerUserId
                )
                SELECT c.*
                FROM chat c
                JOIN LatestMessages lm
                    ON ((c.userId = ? AND c.otherUserId = lm.partnerUserId)
                        OR (c.userId = lm.partnerUserId AND c.otherUserId = ?))
                    AND c.createAt = lm.latestCreateAt
                ORDER BY c.createAt DESC;
            ;`
            const chatlist = await db.all(chatlistQuery, [userId,userId,userId,userId,userId]);
            if (!chatlist) {
                console.log('Error: Chatlist not found');
            }
            else {
                console.log('Chatlist fetched successfully');
                socket.emit('chatlist', chatlist);
            }
        }
        catch(error) {
            console.error('Error fetching chatlist:', error);
        }
    })

    socket.on('fetchMessages', async(userId, otherUserId,) => {
        try {
            const selectQuery = `
            SELECT * FROM chat WHERE ((userId = ? AND otherUserId = ?) OR (otherUserId = ? and userId = ?)) AND userId != otherUserId
            `
            const messages = await db.all(selectQuery, [userId, otherUserId, userId, otherUserId]);
            if (!messages) {
                console.log('Error: Messages not found');
            } else {
                console.log('Messages fetched successfully');
                console.log(messages)
                socket.emit('messages', messages);
            }
        }
        catch (error) {
            console.error('Error fetching messages:', error);
        }
    })

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
    socket.on('addMessage', async (text, userId, userName, userRole, otherUserId, otherUserName, otherUserRole) => {
        try {
            await db.run('BEGIN TRANSACTION');
    
            const insertQuery = `
                INSERT INTO chat (userId, userName, userRole, text, createAt, otheruserId, otherUserName,  systemMessage, otherUserRole)
                VALUES (?, ?, ?, ?, ?,  ?, ?, ?, ?)
            `;
    
            // Insert message for the sender
            await db.run(insertQuery, [userId, userName, userRole, text, Math.floor(Date.now()), otherUserId, otherUserName,  'false', otherUserRole]);
    
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
            }
        } catch (error) {
            console.error('Error adding messages:', error);
            await db.run('ROLLBACK'); // Rollback transaction on error
        }
    });
    socket.on('disconnect',() => {
        console.log(`Client disconnected with ${socket.id}`);
    })
  });

instrument(io, { auth: false });

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API',
        server: serverAddress,
        port: PORT,
    });
});

app.post('/userSignup', async (req, res) => {
    const { socketId, fullName, email, mobileNumber } = req.body;

    // Validate required fields
    if (!fullName || !email || !mobileNumber) {
        return res.status(400).json({ error: 'Full name, email, and mobile number are required' });
    }
    try {
        // Check if user already exists
        const selectQuery = `SELECT * FROM userDetails WHERE mobileNumber = ? OR email = ?`;
        const existingUser = await db.get(selectQuery, [mobileNumber, email]);

        if (existingUser) {
            res.status(409).json({ message : 'User already exists with the same mobile number or email' });
            return;
        }
        else {
            // Insert new user with socket ID
        const insertQuery = `
        INSERT INTO userDetails (socketId, fullName, email, mobileNumber) 
        VALUES (?, ?, ?, ?)
        `;
        await db.run(insertQuery, [socketId, fullName, email, mobileNumber]);
        res.json({ message: 'User registered successfully', socketId });
        }
        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('updateSocketId', async (req,res) => {
    const { socketId, userId } = req.body;
   try {
    const updateQuery = `UPDATE userDetails SET socketId = ? WHERE userId = ?`;
    const isUpdated =  await db.run(updateQuery, [socketId, userId]);
    if(isUpdated == 0) {
        res.status(404).json({ message: 'User not updated' });
    }
    else {
        res.json({ message: 'User updated successfully' });
    }
   }
   catch (error) {
        console.error('Error updating user:', error);
   }
})

app.post('/register', async (req, res) => {
    const { fullName, email, mobileNumber, userName, password } = req.body;

    if (!fullName) {
        res.status(400).send('Full name is required');
        return;
    }
    if (!email) {
        res.status(400).send('E-mail is required');
        return;
    }
    if (!mobileNumber) {
        res.status(400).send('Mobile number is required');
        return;
    }
    if (!userName) {
        res.status(400).send('Username is required');
        return;
    }
    if (!password) {
        res.status(400).send('Password is required');
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const selectQuery = `SELECT * FROM registration WHERE userName = ? OR number = ? OR email = ?`;
        const user = await db.get(selectQuery, [userName, mobileNumber, email]);

        if (!user) {
            const insertQuery = `
                INSERT INTO registration (fullName, email, number, userName, password)
                VALUES (?, ?, ?, ?, ?)
            `;
            const result = await db.run(insertQuery, [fullName, email, mobileNumber, userName, hashedPassword]);
            res.json({
                houseOwnerID: result.lastID,
                Status: "Data inserted successfully",
            });
        } else {
            res.status(400).json({
                Status: "User already exists",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/loggingIn', async (req,res) => {
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
       res.json({
        Status: "User exists",
        userName: userName,
        userId: userId,
        userRole: userRole,
       })
    }
})

app.post('/login', async (req, res) => {
    const { phoneNumber } = req.body;
    const selectQuery = `SELECT number FROM registration WHERE number='${phoneNumber}';`;
    const selectResult = await db.get(selectQuery);

    if (selectResult === undefined) {
        res.status(404).send({
            error_msg: "Mobile number is not Registered",
            ok: false,
        });
    } else {
        const payload = { phoneNumber: phoneNumber };
        const jwtToken = jwt.sign(payload, "house_owner_token");
        res.send({
            JWT_Token: jwtToken,
            ok: true,
        });
    }
});

const houseOwnerAuthToken = (req, res, next) => {
    let jwtToken;

    const authHead = req.headers["authorization"];
    if (authHead !== undefined) {
        jwtToken = authHead.split(" ")[1];
    }
    if (jwtToken === undefined) {
        res.status(401).send("Unauthorized User");
    } else {
        jwt.verify(jwtToken, "house_owner_token", (error, payload) => {
            if (error) {
                res.status(401).send("Invalid Access Token");
            } else {
                req.userNumber = payload.phoneNumber;
                next();
            }
        });
    }
};

app.put('/updateToken', async (req, res) => {
    const { token: firebaseToken } = req.query;

    try {
        const checkQuery = `SELECT * FROM firebaseToken WHERE token = ?`;
        const existingToken = await db.get(checkQuery, [firebaseToken]);

        if (existingToken) {
            const updateQuery = `UPDATE firebaseToken SET token = ? WHERE id = ?`;
            await db.run(updateQuery, [firebaseToken, existingToken.id]);
            res.status(200).json({ message: "Token Updated Successfully" });
        } else {
            const insertQuery = `INSERT INTO firebaseToken (token) VALUES (?)`;
            const result = await db.run(insertQuery, [firebaseToken]);
            res.status(200).json({ message: "Token Added Successfully", tokenID: result.lastID });
        }
    } catch (error) {
        console.error('Error handling Token: ', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/chat/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;
    const getChats = `
        SELECT c.id, c.text, c.createdAt, sender.fullName AS senderName
        FROM chats c 
        JOIN userDetails sender ON c.senderId = sender.id 
        WHERE (c.senderId = ? AND c.receiverId = ?) 
           OR (c.senderId = ? AND c.receiverId = ?)
        ORDER BY c.id DESC
    `;
    try {
        const rows = await db.all(getChats, [senderId, receiverId, receiverId, senderId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "No Chats Found" });
        }
        const formattedChats = rows.map(row => ({
            _id: row.id,
            text: row.text,
            createdAt: row.createdAt,
            user: {
                _id: senderId,
                name: row.senderName,
            }
        }));
        res.json(formattedChats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/chat/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;

    const { text, createdAt } = req.body;

    const insertChat = `
        INSERT INTO chats (text, createdAt, senderId, receiverId) 
        VALUES (?, ?, ?, ?)
    `;
    try {
        const result = await db.run(insertChat, [text, createdAt, senderId, receiverId]);
        res.status(201).json({ message: "Chat Added Successfully" });
    } catch (error) {
        console.error("Error adding chat:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
