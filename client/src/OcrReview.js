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
    <form onSubmit={handleSubmit} style={{ background: '#fffbe6', padding: 20, borderRadius: 8 }}>
      <h2>Review Uncertain OCR Results</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {uncertainItems.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 16 }}>
            <div>Confidence: {Math.round(item.confidence * 100)}%</div>
            <input
              type="text"
              value={corrections[idx]}
              onChange={e => handleChange(idx, e.target.value)}
              style={{ width: '100%', padding: 8, fontSize: 16 }}
            />
          </li>
        ))}
      </ul>
      <button type="submit" style={{ padding: '8px 16px', fontSize: 16 }}>Confirm</button>
    </form>
  );
}

export default OcrReview;
