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
              <OcrReview
                uncertainItems={uncertainItems}
                onConfirm={handleReviewConfirm}
                scramble={scramble}
                moves={moves}
              />
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
          {scramble && moves && moves.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h2>Solution Viewer</h2>
              <twisty-player
                experimental-setup-alg={scramble}
                alg={moves.map(m => m.trim()).join(' ')}
                background="none"
                style={{ width: '100%', height: '400px', border: '1px solid #ccc', borderRadius: '8px' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
