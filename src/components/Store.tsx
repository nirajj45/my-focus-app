import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Trees, Flower2, Coins, Check } from 'lucide-react';
import { TREE_SPECIES } from '../constants';
import { TreeSpecies } from '../types';

interface StoreProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  unlockedTrees: string[];
  onPurchase: (species: TreeSpecies) => void;
}

export const Store: React.FC<StoreProps> = ({ isOpen, onClose, coins, unlockedTrees, onPurchase }) => {
  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Flower2': return <Flower2 size={48} className={color} />;
      default: return <Trees size={48} className={color} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-earth-brown/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-soft-cream w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 flex flex-col max-h-[85vh]"
          >
            <div className="p-8 pb-4 flex justify-between items-center border-b border-earth-brown/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-forest-green/20 text-forest-green rounded-xl">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-earth-brown tracking-tight">Tree Store</h3>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Coins size={16} />
                    <span>{coins} Coins</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-earth-brown/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TREE_SPECIES.map((species) => {
                  const isUnlocked = unlockedTrees.includes(species.id);
                  const canAfford = coins >= species.cost;

                  return (
                    <div 
                      key={species.id}
                      className={`relative p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-4 ${
                        isUnlocked 
                          ? 'bg-forest-green/5 border-forest-green/20' 
                          : 'bg-white border-earth-brown/5 hover:border-forest-green/20'
                      }`}
                    >
                      <div className="p-4 bg-soft-cream rounded-2xl shadow-inner">
                        {getIcon(species.icon, species.color)}
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-black text-earth-brown">{species.name}</h4>
                        <p className="text-sm font-medium text-earth-brown/40">
                          {isUnlocked ? 'Already Unlocked' : `${species.cost} Coins`}
                        </p>
                      </div>

                      {isUnlocked ? (
                        <div className="mt-auto flex items-center gap-2 text-forest-green font-bold bg-forest-green/10 px-4 py-2 rounded-xl">
                          <Check size={18} />
                          Unlocked
                        </div>
                      ) : (
                        <button
                          onClick={() => onPurchase(species)}
                          disabled={!canAfford}
                          className={`mt-auto w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                            canAfford 
                              ? 'bg-forest-green text-white hover:bg-forest-green/90 shadow-lg shadow-forest-green/20' 
                              : 'bg-earth-brown/10 text-earth-brown/40 cursor-not-allowed'
                          }`}
                        >
                          <Coins size={18} />
                          Buy Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-earth-brown/5 text-center">
              <p className="text-xs text-earth-brown/40 font-bold uppercase tracking-widest">
                Focus more to earn coins and unlock exotic trees!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
