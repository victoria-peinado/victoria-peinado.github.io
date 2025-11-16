import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../hooks/useAudio';

export default function Timer({ startTime, duration, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const { playSound, stopSound } = useAudio();
  const isTickingRef = useRef(false); // 1. NEW: Ref to track ticking state

  const onExpireRef = useRef(onExpire);
  const playSoundRef = useRef(playSound);
  const stopSoundRef = useRef(stopSound);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    playSoundRef.current = playSound;
    stopSoundRef.current = stopSound;
  }, [playSound, stopSound]);

  useEffect(() => {
    if (!startTime) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const startMs = startTime.toMillis ? startTime.toMillis() : startTime;
      const elapsed = (now - startMs) / 1000; // seconds
      const remaining = Math.max(0, duration - elapsed);
      return Math.floor(remaining);
    };

    setTimeLeft(calculateTimeLeft());
    isTickingRef.current = false; // Reset on new question

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // --- UPDATED Audio Logic for Looping Sound ---
      if (remaining <= 5 && remaining >= 1) {
        // 2. If 5 seconds or less, and not already ticking, start looping tick
        if (!isTickingRef.current) {
          playSoundRef.current('timer_tick', { loop: true });
          isTickingRef.current = true;
        }
      }

      if (remaining > 5) {
         // 3. Stop tick sound if time is > 5 (e.g., admin adds time)
        if (isTickingRef.current) {
          stopSoundRef.current('timer_tick');
          isTickingRef.current = false;
        }
      }

      if (remaining <= 0) {
        // 4. CRITICAL: Stop the looping tick sound first
        if (isTickingRef.current) {
          stopSoundRef.current('timer_tick');
          isTickingRef.current = false;
        }
        
        if (onExpireRef.current) {
          onExpireRef.current();
        }
        
        playSoundRef.current('times_up'); // 5. NOW play times up
        clearInterval(interval);
      }
      // ---------------------------------

    }, 100);

    return () => {
      clearInterval(interval);
      // 6. Cleanup on unmount
      if (isTickingRef.current) {
        stopSoundRef.current('timer_tick');
        isTickingRef.current = false;
      }
    };
    
  }, [startTime, duration]);

  // ... (getTimerColor and getProgressColor are unchanged) ...
  const getTimerColor = () => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return 'text-primary-light';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-secondary'; // Red
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / duration)* 100;
    if (percentage > 50) return 'bg-primary';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-secondary';
  };

  const progressWidth = (timeLeft / duration) * 100;

  return (
    <div className="w-full">
      <div className={`text-4xl font-display font-bold text-center mb-2 ${getTimerColor()}`}>
        {timeLeft}s
      </div>
      <div className="w-full bg-neutral-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-100`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  );
}