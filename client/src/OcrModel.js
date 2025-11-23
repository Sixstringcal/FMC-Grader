import Tesseract from 'tesseract.js';

const OcrModel = {
  recognize: async (image) => {
    const { data: { text } } = await Tesseract.recognize(image, 'eng', {
      logger: m => console.log(m)
    });
    return text;
  },
  parse: (text) => {
    let scrambleLine = '';
    let movesList = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith('scramble:')) {
        scrambleLine = lines[i].replace(/scramble:/i, '').trim();
      }
      // Moves: look for lines with cube notation (R, U, F, etc.)
      if (/^[RUFLDBxyz2' ]+$/.test(lines[i])) {
        movesList.push(lines[i]);
      }
    }
    return { scramble: scrambleLine, moves: movesList };
  }
};

export default OcrModel;