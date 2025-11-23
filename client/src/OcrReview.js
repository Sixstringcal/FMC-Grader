import React from 'react';

function OcrReview({ uncertainItems, onConfirm, scramble, moves }) {
  // Debug output for scramble and moves
  console.log('OcrReview scramble:', scramble);
  console.log('OcrReview moves:', moves);
  const [corrections, setCorrections] = React.useState(
    uncertainItems.map(item => item.text)
  );

  const handleChange = (idx, value) => {
    const updated = [...corrections];
    updated[idx] = value;
    setCorrections(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(corrections);
  };

  // Build Alg.cubing.net URL from scramble and moves
  const algUrl = scramble && moves && moves.length > 0
    ? `https://alg.cubing.net/?setup=${encodeURIComponent(scramble.replace(/ /g, '_'))}&alg=${encodeURIComponent(moves.join(' '))}`
    : null;

  return (
    <form onSubmit={handleSubmit} className="ocr-review">
      <h2>Review Uncertain OCR Results</h2>
      <ul>
        {uncertainItems.map((item, idx) => (
          <li key={idx}>
            <div>Confidence: {Math.round(item.confidence * 100)}%</div>
            <input
              type="text"
              value={corrections[idx]}
              onChange={e => handleChange(idx, e.target.value)}
            />
          </li>
        ))}
      </ul>
      <button type="submit">Confirm</button>
      {/* Show Alg.cubing.net iframe only if scramble and moves are available */}
      {algUrl && (
        <iframe
          title="Alg.cubing.net"
          src={algUrl}
          width="100%"
          height="400"
          style={{ border: "1px solid #ccc", marginTop: "20px" }}
          allowFullScreen
        />
      )}
    </form>
  );
}

export default OcrReview;
