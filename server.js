const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt=require("jsonwebtoken");

const corsOptions = {
    origin: 'http://192.168.1.13:8081',
    optionsSuccessStatus:200
}

const cors = require('cors');

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, './data/my-database.db'); 
app.use(cors(corsOptions));
const PORT = process.env.PORT || 5000;
let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        console.log('Connected to the SQLite database.');
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

initializeDBAndServer();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    console.log(`it's working for get` )
});

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
        const selectQuery = `SELECT * FROM registration WHERE userName = ? OR number=? OR email=?`;
        const user = await db.get(selectQuery, [userName,mobileNumber,email]);

        if (!user) {
            const insertQuery = `
                INSERT INTO registration (fullName, email, number, userName, password)
                VALUES (?, ?, ?, ?, ?)`;
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

app.post('/login', async(req,res) => {
    const {phoneNumber} = req.body;
    const selectQuery = `SELECT number FROM registration WHERE number='${phoneNumber}';`
    const selectResult = await db.get(selectQuery);

    if (selectResult === undefined) {
        res.status(404);
        res.json({
            error_msg:"Mobile number is not Registered",
            ok:false,
        })
    }
    else {
        const payload={phoneNumber:phoneNumber};
        const jwtToken = jwt.sign(payload,"house_owner_token");
        res.json({
            JWT_Token:jwtToken,
            ok:true,
        });
    }
})

const houseOwnerAuthToken = (req,res,next) => {
    let jwtToken;

  const authHead=request.headers["authorization"]
  if(authHead!== undefined){
  jwtToken=authHead.split(" ") [1];
  }
  if(jwtToken===undefined){
    res.status(401)
    res.send(JSON.stringify("Unauthorized User"))
  }
  else{
    jwt.verify(jwtToken,"house_owner_token",(error,payload)=>{
      if(error){
        res.status(401)
        res.send(JSON.stringify("Invalid Access Token"))
      }
      else{
        req.userNumber=payload.phoneNumber       
        next()
      }
    })
  }
}

app.put('/updateToken', async (req,res) => {
    const {token: firebaseToken} = req.query;

    try {
        const checkQuery = `SELECT * FROM firebaseToken WHERE token = ?`;
        const existingToken = await db.get(checkQuery,[firebaseToken]);

        if (existingToken) {
            const updateQuery = `UPDATE firebaseToken SET token = ? where id = ?`;
            await db.run(updateQuery,[firebaseToken,existingToken.id]);
            res.status(200).json({message:"Token Updated Successfully"});
        } else {
            const insertQuery = `INSERT INTO firebaseToken (token) VALUES (?)`;
            const result = await db.run(insertQuery,[firebaseToken]);
            res.status(200).json({message:"Token Added Successfully",tokenID: result.lastID});
        }
    } catch(error) {
        console.error('Error handling Token: ', error);
        res.status(500).json({error:"Internal Server Error"});
    }
})