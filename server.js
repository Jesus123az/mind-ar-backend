const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Sample database or object storing video and image target URLs by ID
const mediaDatabase = {
  '1': {
    videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1718889988/memo-ar-vid_zycp6q.mp4',
    imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/dino.mind?v=1719058710553'
  },
  '2': {
    videoSrc: 'https://res.cloudinary.com/dqdtdhr16/video/upload/v1718889988/memo-ar-vid_zycp6q.mp4',
    imageTargetSrc: 'https://cdn.glitch.global/ebad8ce1-2c18-42b4-93b9-42b1a1820093/kid.mind?v=1719058695406'
  }
  // Add more entries as needed
};

// Middleware
app.use(cors());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Endpoint to render HTML with dynamic values
app.get('/ar-app', (req, res) => {
  const id = req.query.id;
  const media = mediaDatabase[id];

  if (media) {
    res.render('index', media);
  } else {
    res.status(404).send('Media not found');
  }
});

// Start server and listen on all network interfaces (0.0.0.0)
app.listen(process.env.PORT ||port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
