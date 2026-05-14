import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Web Speech API - speech-to-text and text-to-speech.
 * Fixes: stale closures, duplicate transcript accumulation, voice loading.
 * Works best in Chrome/Edge browsers.
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to avoid stale closure problems
  const isListeningRef = useRef(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const voicesLoadedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Check browser support and set up voice loading
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSpeechRecognition = !!SpeechRecognition;
    const hasSpeechSynthesis = !!window.speechSynthesis;
    setIsSupported(hasSpeechRecognition);

    if (hasSpeechSynthesis) {
      synthRef.current = window.speechSynthesis;

      // Voices may load async; listen for the event
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) voicesLoadedRef.current = true;
      };
      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch {}
        }
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // Start listening — creates a fresh recognition instance each time
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Abort any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    // Reset state
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      // Compute the complete transcript from all results each time.
      // This avoids double-counting because event.results is cumulative
      // within a single recognition session.
      let final = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text + ' ';
        } else {
          interim += text;
        }
      }

      setTranscript(final.trim());
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Please allow microphone permission.');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'aborted') {
        // Intentional abort, do nothing
      } else if (event.error === 'no-speech') {
        // No speech detected — this is normal, recognition will auto-end
        // We'll restart in onend if still listening
      } else if (event.error === 'network') {
        setError('Network error. Speech recognition requires internet connection.');
      }
    };

    recognition.onend = () => {
      // Use ref (not state) to check if we should restart
      if (isListeningRef.current) {
        // Small delay before restarting to avoid rapid fire
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.warn('Failed to restart recognition:', err);
            }
          }
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
      setError('Failed to start speech recognition. Please try again.');
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript('');

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, []);

  // Get final transcript snapshot (combines final + interim into one string)
  const getFinalTranscript = useCallback(() => {
    const combined = (transcript + ' ' + interimTranscript).trim();
    setTranscript(combined);
    setInterimTranscript('');
    return combined;
  }, [transcript, interimTranscript]);

  // Text-to-speech
  const speak = useCallback((text, options = {}) => {
    return new Promise((resolve) => {
      if (!synthRef.current || !text) { resolve(); return; }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.95;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = 'en-US';

      // Select a good English voice
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        const preferredVoice =
          voices.find(v => v.name.includes('Google US English')) ||
          voices.find(v => v.name.includes('Samantha')) ||
          voices.find(v => v.name.includes('Microsoft') && v.lang === 'en-US') ||
          voices.find(v => v.lang === 'en-US' && v.default) ||
          voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        setIsSpeaking(false);
        resolve();
      };

      // Chrome bug: speechSynthesis can get stuck. Resume as a workaround.
      if (synthRef.current.paused) {
        synthRef.current.resume();
      }

      synthRef.current.speak(utterance);

      // Chrome workaround: utterances > ~15s get cut off.
      // Keep-alive timer to prevent Chrome from pausing synthesis.
      const keepAlive = setInterval(() => {
        if (synthRef.current && synthRef.current.speaking) {
          synthRef.current.pause();
          synthRef.current.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 10000);

      utterance.onend = () => {
        clearInterval(keepAlive);
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        clearInterval(keepAlive);
        setIsSpeaking(false);
        resolve();
      };
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
    error,
    startListening,
    stopListening,
    getFinalTranscript,
    setTranscript,
    speak,
    stopSpeaking,
  };
}

export default useVoice;
