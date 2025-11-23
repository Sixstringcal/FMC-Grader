// Uses Google Cloud Vision OCR API instead of Tesseract.js
const GOOGLE_VISION_API_KEY = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
const GOOGLE_VISION_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

const OcrModel = {
  recognize: async (image, accessToken) => {
    // Convert image to base64
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64Image = await toBase64(image);
    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }]
        }
      ]
    };
    const endpoint = GOOGLE_VISION_ENDPOINT;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    const text = result.responses?.[0]?.fullTextAnnotation?.text || '';
    // Extract uncertain items (low confidence)
    const uncertainItems = [];
    const confidenceThreshold = 0.8;
    const pages = result.responses?.[0]?.fullTextAnnotation?.pages || [];
    pages.forEach(page => {
      page.blocks?.forEach(block => {
        block.paragraphs?.forEach(paragraph => {
          paragraph.words?.forEach(word => {
            const wordText = word.symbols?.map(s => s.text).join('') || '';
            const avgConfidence = word.symbols?.reduce((sum, s) => sum + (s.confidence ?? 1), 0) / (word.symbols?.length || 1);
            if (avgConfidence < confidenceThreshold) {
              uncertainItems.push({ text: wordText, confidence: avgConfidence });
            }
          });
        });
      });
    });
    return { text, uncertainItems };
  },
  parse: (text) => {
    let scrambleLine = '';
    let movesList = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    // Helper to add spaces between moves (single letters or letter+modifier)
    const moveRegex = /([RUFLDBMESxyz][2']?|[RUFLDBMESxyz])/g;
    const formatMoves = (line) => line.match(moveRegex)?.join(' ') || line;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith('scramble:')) {
        const raw = lines[i].replace(/scramble:/i, '').trim();
        scrambleLine = formatMoves(raw);
      }
      // Moves: look for lines with cube notation (R, U, F, etc.)
      if (/^[RUFLDBxyz2' ]+$/.test(lines[i])) {
        movesList.push(formatMoves(lines[i]));
      }
    }
    return { scramble: scrambleLine, moves: movesList };
  }
};

export default OcrModel;