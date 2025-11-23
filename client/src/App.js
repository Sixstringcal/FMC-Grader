import React from 'react';
import useAppViewModel from './AppViewModel';

function App() {
  const {
    image,
    scramble,
    moves,
    ocrResult,
    loading,
    handleImageChange,
    handleOcr
  } = useAppViewModel();

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>FMC Grader OCR Webapp</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleOcr} disabled={!image || loading} style={{ marginLeft: 10 }}>
        {loading ? 'Processing...' : 'Transcribe Moves'}
      </button>
      <div style={{ marginTop: 20 }}>
        <h2>Scramble</h2>
        <pre style={{ background: '#e8f4ff', padding: 10 }}>{scramble}</pre>
        <h2>Handwritten Moves</h2>
        <ul style={{ background: '#f4f4f4', padding: 10 }}>
          {moves.map((move, idx) => (
            <li key={idx}>{move}</li>
          ))}
        </ul>
        <details>
          <summary>Raw OCR Result</summary>
          <pre style={{ background: '#f9f9f9', padding: 10 }}>{ocrResult}</pre>
        </details>
      </div>
    </div>
  );
}

export default App;
