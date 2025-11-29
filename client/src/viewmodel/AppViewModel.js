import { useState } from 'react';
import OcrModel from '../model/OcrModel';

export default function useAppViewModel(accessToken) {
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [scramble, setScramble] = useState('');
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uncertainItems, setUncertainItems] = useState([]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleOcr = async () => {
    if (!image) return;
    setLoading(true);
    const { text, uncertainItems, wordConfidenceList } = await OcrModel.recognize(image, accessToken);
    setOcrResult(text);
    setUncertainItems(uncertainItems);
    const { scramble: parsedScramble, moves: parsedMoves } = OcrModel.parse(text, wordConfidenceList);
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
    setMoves,
    uncertainItems,
    setUncertainItems,
    handleImageChange,
    handleOcr
  };
}
