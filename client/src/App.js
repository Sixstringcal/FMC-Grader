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
          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: 8, marginBottom: 12 }}>
            On mobile, choose the Camera option to take a photo instead of uploading.
          </div>
          <button onClick={handleOcr} disabled={!image || loading}>
            {loading ? 'Processing...' : 'Transcribe Moves'}
          </button>
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
