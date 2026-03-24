import React from 'react';
import { Trees, Sprout, Skull, Clock, Target, Coins } from 'lucide-react';
import { ForestStats } from '../types';
import { motion } from 'motion/react';

interface StatsProps {
  stats: ForestStats;
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  const dailyGoal = 4; // 4 trees per day
  const goalProgress = Math.min((stats.grown / dailyGoal) * 100, 100);

  return (
    <div className="w-full max-w-2xl space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/50 p-4 rounded-2xl border border-forest-green/10 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-forest-green/10 rounded-full text-forest-green">
            <Trees size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-60">Trees Grown</p>
            <p className="text-2xl font-bold text-forest-green">{stats.grown}</p>
          </div>
        </div>

        <div className="bg-white/50 p-4 rounded-2xl border border-forest-green/10 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-withered/10 rounded-full text-withered">
            <Skull size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-60">Trees Withered</p>
            <p className="text-2xl font-bold text-withered">{stats.withered}</p>
          </div>
        </div>

        <div className="bg-white/50 p-4 rounded-2xl border border-forest-green/10 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-earth-brown/10 rounded-full text-earth-brown">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-60">Focus Time</p>
            <p className="text-2xl font-bold text-earth-brown">{stats.totalFocusTime}m</p>
          </div>
        </div>

        <div className="bg-white/50 p-4 rounded-2xl border border-amber-500/10 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-500/10 rounded-full text-amber-600">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-60">Coins</p>
            <p className="text-2xl font-bold text-amber-600">{stats.coins}</p>
          </div>
        </div>
      </div>

      {/* Daily Goal Progress Bar */}
      <div className="bg-white/50 p-6 rounded-3xl border border-forest-green/10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-forest-green">
            <Target size={20} />
            <h3 className="font-bold">Daily Goal</h3>
          </div>
          <span className="text-sm font-bold text-earth-brown/60">
            {stats.grown} / {dailyGoal} Trees
          </span>
        </div>
        <div className="h-4 bg-forest-green/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={goalProgress} aria-valuemin={0} aria-valuemax={100}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${goalProgress}%` }}
            className="h-full bg-forest-green"
          />
        </div>
        <p className="mt-3 text-xs text-earth-brown/50 font-medium">
          {goalProgress === 100 
            ? "Amazing! You've reached your daily goal! 🌟" 
            : `Grow ${dailyGoal - stats.grown} more trees to reach your daily goal.`}
        </p>
      </div>
    </div>
  );
};
