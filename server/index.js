const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// Serve uploaded files statically so they can be inspected if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('image'), (req, res) => {
  // Placeholder: OCR may be handled on the client; server returns filename
  res.json({ message: 'Image uploaded', filename: req.file.filename });
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
