import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sprout, Trees as TreeIcon, Play, XCircle, Flower2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TREE_SPECIES } from '../constants';

interface TimerProps {
  isFocusing: boolean;
  onStart: (duration: number, species: string) => void;
  onGiveUp: () => void;
  onComplete: () => void;
  unlockedTrees: string[];
}

export const Timer: React.FC<TimerProps> = ({ isFocusing, onStart, onGiveUp, onComplete, unlockedTrees }) => {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [selectedSpeciesIndex, setSelectedSpeciesIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const availableSpecies = TREE_SPECIES.filter(s => unlockedTrees.includes(s.id));
  const currentSpecies = availableSpecies[selectedSpeciesIndex] || TREE_SPECIES[0];

  useEffect(() => {
    if (isFocusing) {
      setTimeLeft(duration * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(duration * 60);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFocusing]);

  useEffect(() => {
    if (!isFocusing) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isFocusing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isFocusing ? (timeLeft / (duration * 60)) * 100 : 100;

  const getIcon = (iconName: string, size: number, color: string) => {
    switch (iconName) {
      case 'Flower2': return <Flower2 size={size} className={color} />;
      default: return <TreeIcon size={size} className={color} />;
    }
  };

  const nextSpecies = () => {
    setSelectedSpeciesIndex((prev) => (prev + 1) % availableSpecies.length);
  };

  const prevSpecies = () => {
    setSelectedSpeciesIndex((prev) => (prev - 1 + availableSpecies.length) % availableSpecies.length);
  };

  return (
    <div className="flex flex-col items-center gap-8 bg-white/40 backdrop-blur-md p-10 rounded-[3rem] shadow-xl border border-white/50 w-full max-w-md">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress Circle */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-forest-green/10"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={754}
            animate={{ strokeDashoffset: 754 - (754 * progress) / 100 }}
            className="text-forest-green"
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-col items-center z-10">
          <motion.div
            animate={isFocusing ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
            className="mb-2"
          >
            {isFocusing ? (
              <Sprout size={64} className="text-forest-green" />
            ) : (
              getIcon(currentSpecies.icon, 64, currentSpecies.color)
            )}
          </motion.div>
          <span className="text-5xl font-black tracking-tighter text-earth-brown">
            {formatTime(timeLeft)}
          </span>
          {!isFocusing && (
            <span className="text-xs font-bold text-earth-brown/40 uppercase tracking-widest mt-1">
              {currentSpecies.name}
            </span>
          )}
        </div>
      </div>

      {!isFocusing ? (
        <div className="w-full space-y-6">
          {/* Tree Selector */}
          {availableSpecies.length > 1 && (
            <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-earth-brown/5">
              <button 
                onClick={prevSpecies}
                className="p-1 hover:bg-earth-brown/5 rounded-lg text-earth-brown/40"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                {getIcon(currentSpecies.icon, 24, currentSpecies.color)}
                <span className="font-bold text-earth-brown">{currentSpecies.name}</span>
              </div>
              <button 
                onClick={nextSpecies}
                className="p-1 hover:bg-earth-brown/5 rounded-lg text-earth-brown/40"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-earth-brown/60">
              <span>10m</span>
              <span>{duration}m</span>
              <span>120m</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={() => onStart(duration, currentSpecies.id)}
            className="w-full py-4 bg-forest-green text-soft-cream rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-forest-green/90 transition-colors shadow-lg shadow-forest-green/20"
          >
            <Play size={20} fill="currentColor" />
            Plant {currentSpecies.name}
          </button>
        </div>
      ) : (
        <button
          onClick={onGiveUp}
          className="w-full py-4 bg-white text-withered border-2 border-withered/20 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-withered/5 transition-colors"
        >
          <XCircle size={20} />
          Give Up
        </button>
      )}
    </div>
  );
};
