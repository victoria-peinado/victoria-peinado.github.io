import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';

// Create the context
export const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false); // 1. NEW: Global unlock state

  const musicRef = useRef(null);
  const sfxCache = useRef({});

  // ... (volume and mute useEffects are unchanged) ...
  useEffect(() => {
    const storedMusicVol = localStorage.getItem('musicVolume');
    const storedSfxVol = localStorage.getItem('sfxVolume');
    const storedMute = localStorage.getItem('isMuted');

    if (storedMusicVol) setMusicVolume(parseFloat(storedMusicVol));
    if (storedSfxVol) setSfxVolume(parseFloat(storedSfxVol));
    if (storedMute) setIsMuted(JSON.parse(storedMute));
  }, []);

  useEffect(() => {
    localStorage.setItem('musicVolume', musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem('sfxVolume', sfxVolume);
  }, [sfxVolume]);

  useEffect(() => {
    localStorage.setItem('isMuted', isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = isMuted ? 0 : musicVolume;
      musicRef.current.muted = isMuted;
    }
  }, [musicVolume, isMuted, musicRef.current]);

  // 2. NEW: Function to preload sounds (fixes delay)
  const preloadSounds = useCallback((soundNames = []) => {
    soundNames.forEach(soundName => {
      if (!sfxCache.current[soundName]) {
        const src = `/audio/${soundName}.wav`;
        const audio = new Audio(src);
        audio.load(); // Tell the browser to load it
        sfxCache.current[soundName] = audio;
      }
    });
  }, []);

  // 3. UPDATED: playSound now supports a loop option
  const playSound = useCallback((soundName, options = {}) => {
    if (isMuted || !isUnlocked) return; // 4. Check global unlock
    
    try {
      let audio;
      const src = `/audio/${soundName}.wav`;

      if (sfxCache.current[soundName]) {
        audio = sfxCache.current[soundName];
      } else {
        audio = new Audio(src);
        sfxCache.current[soundName] = audio;
      }

      audio.volume = sfxVolume;
      audio.currentTime = 0;
      audio.loop = options.loop || false; // 5. Set loop option
      audio.play();
    } catch (e) {
      console.error(`Could not play sound: ${soundName}.wav`, e);
    }
  }, [sfxVolume, isMuted, isUnlocked]); // 6. Depend on isUnlocked

  const stopSound = useCallback((soundName) => {
    try {
      if (sfxCache.current[soundName]) {
        const audio = sfxCache.current[soundName];
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false; // Ensure loop is turned off
      }
    } catch (e) {
      console.error(`Could not stop sound: ${soundName}.wav`, e);
    }
  }, []);

  // 7. UPDATED: setMusic now checks global unlock
  const setMusic = useCallback((musicName) => {
    if (!isUnlocked) return; // Check global unlock

    if (musicRef.current && musicRef.current.src.includes(musicName)) {
      return;
    }
    
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }

    if (musicName) {
      try {
        const audio = new Audio(`/audio/${musicName}`);
        audio.volume = isMuted ? 0 : musicVolume;
        audio.loop = true;
        audio.play();
        musicRef.current = audio;
      } catch (e) {
        console.error(`Could not play music: ${musicName}`, e);
      }
    }
  }, [musicVolume, isMuted, isUnlocked]); // 8. Depend on isUnlocked

  // 9. NEW: The global unlock function
  const unlockAudio = useCallback(() => {
    setIsUnlocked(true);
    // Preload common sounds to fix delays
    preloadSounds([
      'click', 
      'correct', 
      'incorrect', 
      'timer_tick', 
      'times_up', 
      'fanfare', 
      'question_reveal'
    ]);
  }, [preloadSounds]);

  const value = {
    musicVolume,
    sfxVolume,
    isMuted,
    isUnlocked, // 10. Expose new state/functions
    unlockAudio,
    setMusicVolume,
    setSfxVolume,
    setIsMuted,
    toggleMute: () => setIsMuted(prev => !prev),
    playSound,
    setMusic,
    stopSound,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};