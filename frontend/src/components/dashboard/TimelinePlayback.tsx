import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Rewind, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelinePlaybackProps {
  onTimeChange: (date: Date) => void;
  initialTime: Date;
}

export function TimelinePlayback({ onTimeChange, initialTime }: TimelinePlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const minTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const maxTime = new Date();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = new Date(prev.getTime() + 1000 * playbackSpeed);
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          onTimeChange(next);
          return next;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, onTimeChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const time = new Date(minTime.getTime() + (maxTime.getTime() - minTime.getTime()) * value);
    setCurrentTime(time);
    onTimeChange(time);
  };

  const skipForward = () => {
    const next = new Date(Math.min(currentTime.getTime() + 3600000, maxTime.getTime()));
    setCurrentTime(next);
    onTimeChange(next);
  };

  const skipBackward = () => {
    const prev = new Date(Math.max(currentTime.getTime() - 3600000, minTime.getTime()));
    setCurrentTime(prev);
    onTimeChange(prev);
  };

  const reset = () => {
    setCurrentTime(minTime);
    onTimeChange(minTime);
    setIsPlaying(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const sliderValue = (currentTime.getTime() - minTime.getTime()) / (maxTime.getTime() - minTime.getTime());

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass glass-border rounded-lg p-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-2 rounded bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
          >
            <Rewind className="w-4 h-4" />
          </button>
          <button
            onClick={skipBackward}
            className="p-2 rounded bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-full transition-colors ${
              isPlaying 
                ? 'bg-lime-500/20 text-lime-400 border border-lime-500/50' 
                : 'bg-zinc-800/50 text-white hover:bg-zinc-700/50'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={skipForward}
            className="p-2 rounded bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentTime(maxTime);
              onTimeChange(maxTime);
              setIsPlaying(false);
            }}
            className="p-2 rounded bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1">
          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-lime-500 to-cyan-400"
              style={{ width: `${sliderValue * 100}%` }}
              transition={{ type: 'tween', duration: 0.1 }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.0001"
              value={sliderValue}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-lime-500/50"
              style={{ left: `${sliderValue * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-zinc-500 font-mono">
            <span>{formatTime(minTime)}</span>
            <span className="text-lime-400">{formatTime(currentTime)}</span>
            <span>{formatTime(maxTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Speed</span>
          <div className="flex gap-1">
            {[1, 2, 5, 10].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-lime-500/20 text-lime-400 border border-lime-500/50'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
