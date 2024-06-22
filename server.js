const express = require('express');
const app = express();
const port = 3000;

// Sample database or object storing video and image target URLs by ID
const mediaDatabase = {
  '1': {
    videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1718889988/memo-ar-vid_zycp6q.mp4',
    imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/kid.mind?v=1719058695406'
  },
  '2': {
    videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1718889988/memo-ar-vid_zycp6q.mp4',
    imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/dino.mind?v=1719058710553'
  }
  // Add more entries as needed
};

// Endpoint to get media by ID
app.get('/getMedia', (req, res) => {
  const id = req.query.id;
  const media = mediaDatabase[id];

  if (media) {
    res.json(media);
  } else {
    res.status(404).json({ error: 'Media not found' });
  }
});

// Serve static files if needed
app.use(express.static('public'));

// Start server
app.listen(port, "0.0.0.0" , () => {
  console.log(`Server running at http://localhost:${port}`);
});
