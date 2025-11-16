import React, { useState, useEffect, useRef } from 'react';

export default function Timer({ startTime, duration, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  // 1. Use a ref to store the onExpire callback.
  // This lets us access the *latest* version of the function
  // from inside our interval without causing the useEffect to re-run.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

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

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        // 2. Call the function from the ref.
        if (onExpireRef.current) {
          onExpireRef.current();
        }
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
    
  // 3. The useEffect *only* depends on these stable values.
  // It will no longer reset when the parent page re-renders.
  }, [startTime, duration]);

  const getTimerColor = () => {
    const percentage = (timeLeft / duration) * 100;
    // Use our new "Primal Mana" theme colors
    if (percentage > 50) return 'text-primary-light';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-secondary'; // Red
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / duration) * 100;
    // Use our new "Primal Mana" theme colors
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
      {/* 4. Use themed background for the progress bar */}
      <div className="w-full bg-neutral-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-100`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  );
}