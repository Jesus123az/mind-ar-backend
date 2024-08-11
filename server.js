// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fork } from 'child_process';
import multer from 'multer';
import { promises as fsPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import 'dotenv/config'
import User from './models/user.js';
import HealthInfo from './models/healthInfo.js';

const { unlink } = fsPromises;

const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const uri = process.env.MONGODB_URI

mongoose.connect(uri)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Media database
// const mediaDatabase = {
//   '1': {
//     videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1719074388/video_uwk7hn.mp4',
//     imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/dino.mind?v=1719058710553'
//   },
//   '2': {
//     videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1718889988/memo-ar-vid_zycp6q.mp4',
//     imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/kid.mind?v=1719058695406'
//   }
// };

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));

// Serve media page
app.get('/ar-app', async(req, res) => {
  const id = req.query.id;
  const user = await User.findById(id);
  if(!user.healthInfo){
      res.status(404).send('Media not found');
  }
  const healthInfo = await HealthInfo.findById(user.healthInfo)
  if (healthInfo) {
    res.render('index', healthInfo);
  } else {
    res.status(404).send('Media not found');
  }
});

// Process image upload
app.post('/process-image/:id', upload.single('image'), (req, res) => {
  try {
    const imageFile = req.file;
    const uniqueId = req.params.id; // Get unique ID from params

    if (!imageFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = imageFile.path;

    // Fork a new process for processing the image
    const child = fork('./workers/fileProcessor.js');

    // Listen for messages from the child process
    child.on('message', async (message) => {
      if (message.error) {
        console.error('Error processing image:', message.error);
        return res.status(500).send('Error processing image');
      }

      const outputFilename = message.outputFilename;

      // Send success response
      res.json({
        message: 'Image processed successfully',
        fileUrl: `${req.protocol}://${req.get('host')}/${uniqueId}.mind` // Provide URL to access the file
      });

      // Clean up the uploaded image file
      await unlink(imagePath).catch((err) => {
        console.error('Error deleting file:', err);
      });
    });

    // Send the image path and unique ID to the child process for processing
    child.send({ imagePath, uniqueId });
  } catch (err) {
    console.error('Error processing image:', err);
    res.status(500).send('Error processing image');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
