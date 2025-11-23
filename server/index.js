const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/upload', upload.single('image'), (req, res) => {
  // Placeholder: OCR should be handled on the client for now
  res.json({ message: 'Image uploaded', filename: req.file.filename });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
