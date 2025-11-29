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
                    features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                    imageContext: {
                        languageHints: ['en']
                    }
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
            let text = result.responses?.[0]?.fullTextAnnotation?.text || '';
            // Normalize OCR output: remove pipe characters, treat '4' as 'U', and uppercase 'u'
            const normalizeOcrText = (s) => {
                if (!s) return s;
                // Remove common pipe/box artifacts and similar vertical bars
                s = s.replace(/\|/g, '');
                // Replace digit 4 (often misread for 'U') with 'U'
                s = s.replace(/4/g, 'U');
                // Uppercase any lowercase 'u' (common mis-cased move)
                s = s.replace(/\bu\b/g, 'U');
                // Also uppercase 'u' when part of moves or adjacent to punctuation/whitespace
                s = s.replace(/u/g, 'U');
                return s;
            };
            text = normalizeOcrText(text);
            // Extract uncertain items (low confidence) for review/inspection
            const uncertainItems = [];
            const confidenceThreshold = 0.8;
            const pages = result.responses?.[0]?.fullTextAnnotation?.pages || [];
            pages.forEach(page => {
                page.blocks?.forEach(block => {
                    block.paragraphs?.forEach(paragraph => {
                        paragraph.words?.forEach(word => {
                            let wordText = word.symbols?.map(s => s.text).join('') || '';
                            const avgConfidence = word.symbols?.reduce((sum, s) => sum + (s.confidence ?? 1), 0) / (word.symbols?.length || 1);
                            if (avgConfidence < confidenceThreshold) {
                                // Normalize uncertain word text as well
                                wordText = normalizeOcrText(wordText);
                                uncertainItems.push({ text: wordText, confidence: avgConfidence });
                            }
                        });
                    });
                });
            });
            return { text, uncertainItems };
    },
    parse: (text) => {
        return parseMoves(text);
    }
};

function formatMoves(line) {
    // Remove any pipe characters that may have been read from boxes/lines
    line = (line || '').replace(/\|/g, '');
    const moveRegex = /(?:[URFDLB](?:w)?(?:2|')?|[xyz](?:2|')?)/gi;
    const matches = line.match(moveRegex);
    return matches ? matches : (line ? line.split(/\s+/).filter(Boolean) : []);
}

function parseMoves(text) {
    let movesList = [];

    // Find the last occurrence of the word "Scramble" (case-insensitive).
    // The text after that occurrence (optionally after a colon/newline) is treated as the scramble + moves.
    let body = text || '';
    // Globally remove any pipe characters that may separate tokens in OCR output
    body = body.replace(/\|/g, '');
    const lower = body.toLowerCase();
    const idx = lower.lastIndexOf('scramble');
    if (idx !== -1) {
        body = body.slice(idx + 'scramble'.length);
        // Strip leading colons and whitespace/newlines
        body = body.replace(/^[\s:]+/, '');
    }

    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let scrambleLine = '';
    if (lines.length) {
        // First non-empty line is treated as scramble; keep as formatted string
        const scrambleTokens = formatMoves(lines[0]);
        scrambleLine = scrambleTokens.join(' ');

        // Subsequent lines: split into tokens and mark uncertain tokens (those that don't match moveRegex)
        const moveRegex = /^(?:[URFDLB](?:w)?(?:2|')?|[xyz](?:2|')?)$/i;
        for (let i = 1; i < lines.length; i++) {
            const tokens = formatMoves(lines[i]);
            tokens.forEach(tok => {
                const isMatch = moveRegex.test(tok);
                movesList.push({ text: tok, uncertain: !isMatch });
            });
        }
    }
    return { scramble: scrambleLine, moves: movesList };
}

export default OcrModel;
