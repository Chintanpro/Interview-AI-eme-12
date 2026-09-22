import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Web Speech API - speech-to-text and text-to-speech.
 * Keeps finalized text across browser recognition restarts and cleans up
 * speech resources when the component unmounts.
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  const isListeningRef = useRef(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const restartTimerRef = useRef(null);
  const speechKeepAliveRef = useRef(null);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognition));

    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      isListeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (err) { console.warn('Failed to abort speech recognition:', err); }
      }
      if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (err) { console.warn('Failed to abort existing recognition:', err); }
      recognitionRef.current = null;
    }

    accumulatedTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += `${text} `;
        else interim += text;
      }
      if (finalChunk) {
        accumulatedTranscriptRef.current = `${accumulatedTranscriptRef.current} ${finalChunk}`.trim();
      }
      setTranscript(accumulatedTranscriptRef.current);
      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Please allow microphone permission.');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'network') {
        setError('Network error. Speech recognition requires internet connection.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Speech recognition failed: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current && recognitionRef.current === recognition) {
        restartTimerRef.current = setTimeout(() => {
          if (!isListeningRef.current || recognitionRef.current !== recognition) return;
          try { recognition.start(); } catch (err) { console.warn('Failed to restart recognition:', err); }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      recognitionRef.current = null;
      isListeningRef.current = false;
      setIsListening(false);
      setError('Failed to start speech recognition. Please try again.');
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (err) { console.warn('Failed to stop speech recognition:', err); }
    }
  }, []);

  const getFinalTranscript = useCallback(() => {
    const combined = `${accumulatedTranscriptRef.current} ${interimTranscript}`.trim();
    accumulatedTranscriptRef.current = combined;
    setTranscript(combined);
    setInterimTranscript('');
    return combined;
  }, [interimTranscript]);

  const speak = useCallback((text, options = {}) => new Promise((resolve) => {
    if (!synthRef.current || !text) { resolve(); return; }
    synthRef.current.cancel();
    if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    utterance.lang = 'en-US';

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English'))
      || voices.find(v => v.name.includes('Samantha'))
      || voices.find(v => v.name.includes('Microsoft') && v.lang === 'en-US')
      || voices.find(v => v.lang === 'en-US' && v.default)
      || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }
      setIsSpeaking(false);
      resolve();
    };
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = finish;
    utterance.onerror = (event) => { console.warn('TTS error:', event); finish(); };

    if (synthRef.current.paused) synthRef.current.resume();
    synthRef.current.speak(utterance);
    speechKeepAliveRef.current = setInterval(() => {
      if (synthRef.current?.speaking) {
        synthRef.current.pause();
        synthRef.current.resume();
      } else if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }
    }, 10000);
  }), []);

  const stopSpeaking = useCallback(() => {
    if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
    speechKeepAliveRef.current = null;
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening, transcript, interimTranscript, isSpeaking, isSupported, error,
    startListening, stopListening, getFinalTranscript, setTranscript, speak, stopSpeaking,
  };
}

export default useVoice;
