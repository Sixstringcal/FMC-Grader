import { useState } from 'react';
import OcrModel from './OcrModel';

export default function useAppViewModel(accessToken) {
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [scramble, setScramble] = useState('');
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleOcr = async () => {
    if (!image) return;
    setLoading(true);
    const text = await OcrModel.recognize(image, accessToken);
    setOcrResult(text);
    const { scramble: parsedScramble, moves: parsedMoves } = OcrModel.parse(text);
    setScramble(parsedScramble);
    setMoves(parsedMoves);
    setLoading(false);
  };

  return {
    image,
    scramble,
    moves,
    ocrResult,
    loading,
    handleImageChange,
    handleOcr
  };
}