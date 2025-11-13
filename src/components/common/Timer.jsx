import React, { useState, useEffect } from 'react';

export default function Timer({ startTime, duration, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!startTime) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const startMs = startTime.toMillis ? startTime.toMillis() : startTime;
      const elapsed = (now - startMs) / 1000; // seconds
      const remaining = Math.max(0, duration - elapsed);
      return Math.floor(remaining);
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every 100ms for smooth countdown
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0 && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, onExpire]);

  const getTimerColor = () => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return 'text-green-400';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-red-500';
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressWidth = (timeLeft / duration) * 100;

  return (
    <div className="w-full">
      <div className={`text-4xl font-bold text-center mb-2 ${getTimerColor()}`}>
        {timeLeft}s
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-100`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  );
}