import React from 'react';

function OcrReview({ uncertainItems, onConfirm }) {
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
    </form>
  );
}

export default OcrReview;
