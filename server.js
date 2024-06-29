import express from 'express';
import path from 'path';
import cors from 'cors';
import { OfflineCompiler } from './utils/image-target/offline-compiler.js';
import { loadImage } from 'canvas';
import multer from 'multer';
import fs from 'fs'
import { promises as fsPromises } from 'fs';

const { writeFile } = fsPromises;

const app = express();
const port = 3000;

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
// Process image upload
app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    const imageFile = req.file;
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = imageFile.path;
    const images = await Promise.all([loadImage(imagePath)]); // loadImage expects an array

    const compiler = new OfflineCompiler();
    await compiler.compileImageTargets(images, console.log);
    const buffer = compiler.exportData();
    
    // Writing the generated file to disk
    await writeFile('targets.mind', buffer);

    // Sending the file as response
    res.download('targets.mind', 'targets.mind', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error sending file'); // Send error message if download fails
      } else {
        // Optionally, you can delete the temporary file after sending
        fsPromises.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          }
        });
      }
    });
  } catch (err) {
    console.error('Error processing image:', err);
    res.status(500).send('Error processing image');
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
