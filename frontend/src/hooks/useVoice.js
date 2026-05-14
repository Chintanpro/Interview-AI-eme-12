import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Web Speech API - speech-to-text and text-to-speech
 * Works best in Chrome/Edge browsers
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Check support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition && !!window.speechSynthesis;
    setIsSupported(supported);

    if (supported) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Initialize recognition instance
  const getRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) return;

    setTranscript('');
    setInterimTranscript('');

    let finalText = '';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        finalText += final;
        setTranscript(finalText.trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
      // Auto-restart on network or no-speech errors
      if (event.error === 'network' || event.error === 'no-speech') {
        try { recognition.start(); } catch {}
      }
    };

    recognition.onend = () => {
      // If we're still supposed to be listening, restart
      if (isListening) {
        try { recognition.start(); } catch {}
      }
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
    }
  }, [getRecognition, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Get final transcript (combines final + interim)
  const getFinalTranscript = useCallback(() => {
    const combined = (transcript + ' ' + interimTranscript).trim();
    setTranscript(combined);
    setInterimTranscript('');
    return combined;
  }, [transcript, interimTranscript]);

  // Text-to-speech: speak text aloud
  const speak = useCallback((text, options = {}) => {
    return new Promise((resolve) => {
      if (!synthRef.current) { resolve(); return; }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.95;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = 'en-US';

      // Try to get a good English voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Samantha') || v.name.includes('Google US') || 
        v.name.includes('Microsoft') || (v.lang === 'en-US' && v.default)
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };

      synthRef.current.speak(utterance);
    });
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    getFinalTranscript,
    setTranscript,
    speak,
    stopSpeaking,
  };
}

export default useVoice;
