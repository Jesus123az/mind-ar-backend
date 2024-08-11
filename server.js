// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fork } from 'child_process';
import multer from 'multer';
import { promises as fsPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const { unlink } = fsPromises;

const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Media database
const mediaDatabase = {
  '1': {
    videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1719074388/video_uwk7hn.mp4',
    imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/dino.mind?v=1719058710553'
  },
  '2': {
    videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1718889988/memo-ar-vid_zycp6q.mp4',
    imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/kid.mind?v=1719058695406'
  }
};

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));

// Serve media page
app.get('/ar-app', (req, res) => {
  const id = req.query.id;
  const media = mediaDatabase[id];

  if (media) {
    res.render('index', media);
  } else {
    res.status(404).send('Media not found');
  }
});

// Process image upload
app.post('/process-image', upload.single('image'), (req, res) => {
  try {
    const imageFile = req.file;

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

      // Send the file as response
      res.download(outputFilename, 'targets.mind', async (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error sending file');
        } else {
          // Clean up the generated mind file
          await unlink(outputFilename).catch((err) => {
            console.error('Error deleting file:', err);
          });
        }
      });
    });

    // Send the image path to the child process for processing
    child.send({ imagePath });
  } catch (err) {
    console.error('Error processing image:', err);
    res.status(500).send('Error processing image');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
