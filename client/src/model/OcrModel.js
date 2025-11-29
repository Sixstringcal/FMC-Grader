// Uses Google Cloud Vision OCR API instead of Tesseract.js
const GOOGLE_VISION_API_KEY = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
const GOOGLE_VISION_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

// Confidence threshold used for flagging low-confidence words/moves
const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

// Normalize OCR output across the module so both recognition and parsing
// use the same normalization rules.
const normalizeOcrText = (s) => {
    if (!s) return s;
    s = s.replace(/\|/g, '');
    s = s.replace(/4/g, 'U');
    s = s.replace(/\bu\b/g, 'U');
    s = s.replace(/u/g, 'U');
    return s;
};

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
                        languageHints: ['en'],
                        // Enable text-detection confidence scores for TEXT_DETECTION
                        textDetectionParams: {
                            enableTextDetectionConfidenceScore: true
                        }
                        // advancedOcrOptions: ['legacyLayout'] // optional
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
                text = normalizeOcrText(text);

                // Extract confidences at several levels (page, language, block, paragraph, word, symbol)
                const wordConfidenceList = [];
                const uncertainItems = [];
                const pageConfidenceList = [];
                const languageConfidences = [];
                const blockConfidenceList = [];
                const paragraphConfidenceList = [];

                const confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD;
                const pages = result.responses?.[0]?.fullTextAnnotation?.pages || [];
                pages.forEach((page, pageIndex) => {
                    if (typeof page.confidence === 'number') pageConfidenceList.push({ page: pageIndex, confidence: page.confidence });
                    if (page.property?.detectedLanguages) {
                        page.property.detectedLanguages.forEach(lang => {
                            languageConfidences.push({ languageCode: lang.languageCode, confidence: lang.confidence });
                        });
                    }
                    page.blocks?.forEach((block, blockIndex) => {
                        if (typeof block.confidence === 'number') blockConfidenceList.push({ page: pageIndex, block: blockIndex, confidence: block.confidence });
                        block.paragraphs?.forEach((paragraph, paraIndex) => {
                            if (typeof paragraph.confidence === 'number') paragraphConfidenceList.push({ page: pageIndex, block: blockIndex, paragraph: paraIndex, confidence: paragraph.confidence });
                            paragraph.words?.forEach(word => {
                                const rawWordText = word.symbols?.map(s => s.text).join('') || '';
                                // Prefer explicit word.confidence if present, otherwise average symbol confidences when available
                                let avgConfidence = null;
                                if (typeof word.confidence === 'number') {
                                    avgConfidence = word.confidence;
                                } else if (Array.isArray(word.symbols) && word.symbols.length) {
                                    const symbolConfs = word.symbols.map(s => (typeof s.confidence === 'number' ? s.confidence : null)).filter(c => c !== null);
                                    if (symbolConfs.length) {
                                        avgConfidence = symbolConfs.reduce((a, b) => a + b, 0) / symbolConfs.length;
                                    }
                                }

                                // Fallback: if we couldn't compute a numeric confidence, default to 1 (very confident)
                                if (avgConfidence === null || Number.isNaN(avgConfidence)) avgConfidence = 1;

                                const normalized = normalizeOcrText(rawWordText);
                                const entry = { text: normalized, confidence: avgConfidence, boundingBox: word.boundingBox };
                                wordConfidenceList.push(entry);
                                if (avgConfidence < confidenceThreshold) {
                                    uncertainItems.push(entry);
                                }
                            });
                        });
                    });
                });

                return { text, uncertainItems, wordConfidenceList, pageConfidenceList, languageConfidences, blockConfidenceList, paragraphConfidenceList };
    },
    parse: (text, wordConfidenceList = []) => {
        return parseMoves(text, wordConfidenceList);
    }
};

function formatMoves(line) {
    // Remove any pipe characters that may have been read from boxes/lines
    line = (line || '').replace(/\|/g, '');
    const moveRegex = /(?:[URFDLB](?:w)?(?:2|')?|[xyz](?:2|')?)/gi;
    const matches = line.match(moveRegex);
    return matches ? matches : (line ? line.split(/\s+/).filter(Boolean) : []);
}

function parseMoves(text, wordConfidenceList = []) {
    let movesList = [];
    // Build a lookup map from normalized OCR word -> confidences
    const confMap = new Map();
    (wordConfidenceList || []).forEach(w => {
        const key = (w.text || '').toString().toLowerCase();
        if (!confMap.has(key)) confMap.set(key, []);
        confMap.get(key).push(typeof w.confidence === 'number' ? w.confidence : 1);
    });

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
                // Normalize token text for consistent display and matching
                const displayTok = (normalizeOcrText(tok) || '').toString().trim();
                const isMatch = moveRegex.test(displayTok);
                // Find matching OCR word confidences. Try exact normalized match first, then stripped punctuation.
                const normTok = displayTok.toString().toLowerCase();
                let confidences = confMap.get(normTok) || null;
                if (!confidences) {
                    const stripped = normTok.replace(/[^a-z0-9]/gi, '');
                    confidences = confMap.get(stripped) || null;
                }
                let confidence = null;
                if (confidences && confidences.length) {
                    // use average confidence for matched OCR words
                    confidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
                }

                // Determine low-confidence status; set uncertain flag but do NOT modify move text.
                const isLowConfidence = (typeof confidence === 'number') && (confidence < DEFAULT_CONFIDENCE_THRESHOLD);
                const uncertainFlag = !isMatch || isLowConfidence;
                movesList.push({ text: displayTok, uncertain: uncertainFlag, confidence });
            });
        }
    }
    // Collapse accidental adjacent duplicate tokens often produced by OCR artifacts
    if (movesList && movesList.length > 1) {
        const dedup = [];
        for (let i = 0; i < movesList.length; i++) {
            if (i === 0 || movesList[i].text !== movesList[i - 1].text) {
                dedup.push(movesList[i]);
            }
        }
        movesList = dedup;
    }
    // Optionally compute an average confidence for the scramble tokens (if available)
    let scrambleConfidence = null;
    if (scrambleLine && wordConfidenceList && wordConfidenceList.length) {
        const toks = scrambleLine.split(/\s+/).filter(Boolean);
        const confidences = toks.map(t => {
            const key = normalizeOcrText(t).toString().toLowerCase();
            let c = (confMap.get(key) || [null])[0];
            if (c == null) {
                const stripped = key.replace(/[^a-z0-9]/gi, '');
                c = (confMap.get(stripped) || [null])[0];
            }
            return c;
        }).filter(c => typeof c === 'number');
        if (confidences.length) scrambleConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    return { scramble: scrambleLine, scrambleConfidence, moves: movesList };
}

export default OcrModel;
