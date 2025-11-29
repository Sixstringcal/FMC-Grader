import React, { useState } from 'react';
import useAppViewModel from './viewmodel/AppViewModel';
import GoogleAuth from './view/GoogleAuth';
import PrivacyPolicy from './PrivacyPolicy';
import './App.css';

function App() {
  if (typeof window !== 'undefined' && window.location && window.location.pathname === '/privacy-policy') {
    return <PrivacyPolicy />;
  }
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem('accessToken'));
  const {
    image,
    scramble,
    moves,
    ocrResult,
    loading,
    handleImageChange,
    handleOcr,
    setMoves
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
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState('');

  const handleReviewConfirm = (newCorrections) => {
    setCorrections(newCorrections);
  };

  const saveEdit = (idx, value, _setMoves, _setEditingIndex, _setEditValue) => {
    const tokens = (value || '').match(/(?:[URFDLB](?:w)?(?:2|')?|[xyz](?:2|')?)/gi) || [];
    setMoves(prev => {
      const copy = [...prev];
      // Replace the single item at idx with the parsed tokens (or remove if tokens empty)
      copy.splice(idx, 1, ...tokens.map(t => {
        const isMatch = /^(?:[URFDLB](?:w)?(?:2|')?|[xyz](?:2|')?)$/i.test(t);
        return { text: t, uncertain: !isMatch };
      }));
      return copy;
    });
    setEditingIndex(-1);
    setEditValue('');
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
          <div className="controls-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input id="file-input" type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
              <label htmlFor="file-input" className="icon-button" title="Upload or use camera">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21 19V8a2 2 0 0 0-2-2h-3l-1-2H9L8 6H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a0 0 0 0 0 0 0z" stroke="#234" strokeWidth="0" fill="#2a4d69" opacity="0.95"/>
                  <circle cx="12" cy="13" r="3.5" fill="#fff" />
                  <circle cx="12" cy="13" r="2" fill="#2a4d69" />
                </svg>
              </label>

              <button onClick={handleOcr} disabled={!image || loading}>
                {loading ? 'Processing...' : 'Transcribe Moves'}
              </button>
            </div>

            <div className="move-count" aria-live="polite">
              <div className="move-count-label">Moves</div>
              <div className="move-count-value">{moves ? moves.length : 0}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: 8, marginBottom: 12 }}>
            On mobile, choose the Camera option to take a photo instead of uploading.
          </div>
          <div>
            <h2>Scramble</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: '100%', fontFamily: 'monospace', fontSize: '1.1em', background: '#f8f8f8', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }}>{scramble}</pre>
            <h2>Handwritten Moves</h2>
            <div className="moves-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {moves && moves.length > 0 && moves.map((moveObj, idx) => (
                <div
                  key={idx}
                  className="move-item"
                  onClick={() => {
                    setEditingIndex(idx);
                    setEditValue(moveObj.text || '');
                  }}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '6px 4px',
                    borderBottom: '1px solid #eee',
                    fontFamily: 'monospace',
                    fontSize: '1.1em',
                    position: 'relative',
                    background: moveObj.uncertain ? 'rgba(255, 243, 205, 0.8)' : 'transparent',
                    borderRadius: 4
                  }}
                >
                  {moveObj.uncertain && (
                    <div className="uncertain-badge" aria-hidden title="Uncertain move">
                      ?
                    </div>
                  )}
                  {editingIndex === idx ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEdit(idx, editValue, setMoves, setEditingIndex, setEditValue);
                          } else if (e.key === 'Escape') {
                            setEditingIndex(-1);
                            setEditValue('');
                          }
                        }}
                        style={{ fontFamily: 'monospace', fontSize: '1.1em', padding: '4px' }}
                      />
                      <button onClick={() => saveEdit(idx, editValue, setMoves, setEditingIndex, setEditValue)}>Save</button>
                      <button onClick={() => { setEditingIndex(-1); setEditValue(''); }}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div>{moveObj.text}</div>
                      {typeof moveObj.confidence === 'number' && (
                        <div style={{ fontSize: '0.65em', color: '#555', opacity: 0.9 }} aria-label={`confidence ${Math.round(moveObj.confidence * 100)}%`}>
                          {Math.round(moveObj.confidence * 100)}%
                        </div>
                      )}
                    </div>
                  )}
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

      <footer className="app-footer" aria-label="Footer">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
          <a href="https://github.com/Sixstringcal/FMC-Grader" target="_blank" rel="noopener noreferrer" className="github-link">
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden focusable="false" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 012 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.28.24.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>FMC-Grader on GitHub</span>
          </a>

          <a href="/privacy-policy" className="privacy-link">Privacy Policy</a>
        </div>
      </footer>

    </div>
  );
}

export default App;
