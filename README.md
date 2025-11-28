# FMC Grader

A web application for transcribing handwritten Rubik's Cube FMC solution sheets using OCR.

## Features
- Upload an image of a solution sheet
- Automatically extract scramble and handwritten moves
- Display transcribed moves and scramble

## Tech Stack
- Frontend: React
- Backend: Node.js/Express
- OCR: Tesseract.js

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at `http://localhost:3000`

## Folder Structure
- `/client` - React frontend
- `/server` - Node.js/Express backend

## Notes
- Replace any placeholder assets with your actual solution sheet images.
- Tesseract.js is used for OCR; you may need to tune its configuration for best results on handwritten moves.
