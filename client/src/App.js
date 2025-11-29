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
                  style={{ cursor: 'pointer', textAlign: 'center', padding: '4px 0', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: '1.1em', position: 'relative' }}
                >
                  {moveObj.uncertain && (
                    <div className="uncertain-badge" aria-hidden>
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
                    moveObj.text
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
    </div>
  );
}

export default App;
