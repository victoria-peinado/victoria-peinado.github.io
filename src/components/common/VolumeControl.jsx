import React from 'react';
import { useAudio } from '../../hooks/useAudio';
import { FaVolumeUp, FaVolumeMute, FaMusic } from 'react-icons/fa';
import { IoBarChart } from 'react-icons/io5'; // Using a different icon for SFX

const VolumeControl = () => {
  const {
    musicVolume,
    sfxVolume,
    isMuted,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
  } = useAudio();

  // Re-styled to use "Nightfall" theme tokens (neutral colors, primary accent)
  return (
    <div className="flex items-center gap-3 text-white">
      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="text-2xl text-neutral-400 hover:text-primary transition-colors"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>

      {/* Sliders Container */}
      <div className="flex flex-col gap-1.5">
        
        {/* Music Volume Slider */}
        <div className="flex items-center gap-2">
          <FaMusic className="text-neutral-500" aria-label="Music volume" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={isMuted}
          />
        </div>

        {/* SFX Volume Slider */}
        <div className="flex items-center gap-2">
          <IoBarChart className="text-neutral-500" aria-label="Sound effects volume" /> 
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sfxVolume}
            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={isMuted}
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;