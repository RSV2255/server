const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');


const ensureImageDirectoryExists = () => {
    const uploadDir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
};

const ensureVideoDirectoryExists = () => {
    const uploadsDir = path.join(__dirname, '..', 'videos');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
};

const ensurePdfDirectoryExists = () => {
    const uploadsDir = path.join(__dirname, '..', 'pdf');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
};
module.exports = (db) => {
    router.post('/upload-image', (req, res) => {
        console.log(req.body);
        ensureImageDirectoryExists();
        const {image, fileName, extension} = req.body;
    
        const buffer = Buffer.from(image, 'base64');
        const filePath = path.join(__dirname, '..', 'images', `${fileName}.${extension}`);
    
        fs.writeFile(filePath, buffer, (err) => {
            if(err) {
                console.error('Error saving image file: ', err);
                return res.status(500).send({error: 'Error saving image File'})
            }
            console.log('Image saved Successfully');
            res.json({imageUrl: `images/${fileName}.${extension}`});
        });
    });
    
    router.post('/upload-video', (req, res) => {
        ensureVideoDirectoryExists();
        const { video,fileName,extension } = req.body;
        const buffer = Buffer.from(video, 'base64');
        const filePath = path.join(__dirname, '..', 'videos', `${fileName}.${extension}`);
      
    
        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
            console.error('Error saving video file:', err);
            return res.status(500).send({ error: 'Error saving video file' });
          }
          console.log('Video file saved successfully.');
          res.json({ videoUrl: `videos/${fileName}.${extension}` });
        });
    });
    
    router.post('/upload-pdf', (req,res) => {
        ensurePdfDirectoryExists();
        const { pdf,fileName,extension } = req.body;
        const buffer = Buffer.from(pdf, 'base64');
        const filePath = path.join(__dirname, '..', 'pdf', `${fileName}.${extension}`);
    
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error saving pdf file', err);
                return res.status(500).send({ error: 'Error saving pdf file' });
            }
            console.log('Pdf file saved successfully.');
            res.send({ pdfUrl: `pdf/${fileName}.${extension}`});
        })
    });

    return router;
};
