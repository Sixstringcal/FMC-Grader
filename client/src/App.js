import React, { useState } from 'react';
import useAppViewModel from './AppViewModel';
import GoogleAuth from './GoogleAuth';
import OcrReview from './OcrReview';
import './App.css';

function App() {
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem('accessToken'));
  const {
    image,
    scramble,
    moves,
    ocrResult,
    loading,
    uncertainItems,
    setUncertainItems,
    handleImageChange,
    handleOcr
  } = useAppViewModel(accessToken);

  // Persist accessToken in localStorage
  const setAccessToken = (token) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  };
  const [corrections, setCorrections] = useState(null);

  const handleReviewConfirm = (newCorrections) => {
    setCorrections(newCorrections);
    setUncertainItems([]);
    // Optionally, update moves/scramble with corrections if needed
  };

  return (
    <div className="app-container">
      <h1>FMC Grader OCR Webapp</h1>
      {!accessToken && (
        <div style={{ marginBottom: 20 }}>
          <GoogleAuth onAuth={setAccessToken} />
        </div>
      )}
      {accessToken && (
        <>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button onClick={handleOcr} disabled={!image || loading}>
            {loading ? 'Processing...' : 'Transcribe Moves'}
          </button>
          {uncertainItems && uncertainItems.length > 0 ? (
            <div className="ocr-review">
              <OcrReview uncertainItems={uncertainItems} onConfirm={handleReviewConfirm} />
            </div>
          ) : (
            <div>
              <h2>Scramble</h2>
              <pre>{scramble}</pre>
              <h2>Handwritten Moves</h2>
              <ul>
                {moves.map((move, idx) => (
                  <li key={idx}>{move}</li>
                ))}
              </ul>
              <details className="details">
                <summary>Raw OCR Result</summary>
                <pre>{ocrResult}</pre>
              </details>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
