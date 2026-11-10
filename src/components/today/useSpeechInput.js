import { useCallback, useRef, useState } from 'react';

export default function useSpeechInput(onText) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const toggle = useCallback(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Voice input is not available in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-AU';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onText(transcript);
    };
    recognition.onerror = () => setError('Voice input stopped. Please try again.');
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setError('');
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setError('Voice input could not start.');
    }
  }, [listening, onText]);

  return { listening, error, toggle };
}