import React, { useState } from 'react';
import useAppViewModel from './viewmodel/AppViewModel';
import GoogleAuth from './view/GoogleAuth';
import './App.css';

function App() {
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem('accessToken'));
  const {
    image,
    scramble,
    moves,
    ocrResult,
    loading,
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
  };

  return (
    <div className="app-container">
      <h1>FMC Grader OCR</h1>
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
          <div>
            <h2>Scramble</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: '100%', fontFamily: 'monospace', fontSize: '1.1em', background: '#f8f8f8', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }}>{scramble}</pre>
            <h2>Handwritten Moves</h2>
            <div className="moves-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {moves && moves.length > 0 && moves.map((moveObj, idx) => (
                <div key={idx} className="move-item" style={{ textAlign: 'center', padding: '4px 0', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: '1.1em', position: 'relative' }}>
                  {moveObj.uncertain && (
                    <div className="uncertain-badge" aria-hidden>
                      ?
                    </div>
                  )}
                  {moveObj.text}
                </div>
              ))}
            </div>
            <details className="details">
              <summary>Raw OCR Result</summary>
              <pre>{ocrResult}</pre>
            </details>
          </div>
          {scramble && moves && moves.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h2>Solution Viewer</h2>
              <twisty-player
                experimental-setup-alg={scramble}
                alg={moves.map(m => m.text).join(' ')}
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
