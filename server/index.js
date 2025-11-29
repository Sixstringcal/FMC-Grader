const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// Do not persist uploaded files to disk. Use memory storage and do not save buffers.
app.post('/upload', upload.single('image'), (req, res) => {
  // The uploaded file (if any) is available in memory as `req.file.buffer`.
  // Intentionally do NOT write the buffer to disk or persist it on the server.
  // If you need server-side OCR or forwarding, implement forwarding here and
  // ensure any buffers are handled according to your retention policy.
  res.json({ message: 'Image received; server is configured not to store uploads' });
});

// In production, serve React build from the client folder if it exists
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
try {
  // Only enable static serving if build exists
  const fs = require('fs');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }
} catch (err) {
  console.error('Error checking client build path', err);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
