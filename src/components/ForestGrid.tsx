import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trees as TreeIcon, Skull, Sprout, Flower2 } from 'lucide-react';
import { Tree } from '../types';
import { TREE_SPECIES } from '../constants';

interface ForestGridProps {
  trees: Tree[];
}

export const ForestGrid: React.FC<ForestGridProps> = ({ trees }) => {
  const getTreeIcon = (tree: Tree) => {
    if (tree.status === 'withered') return <Skull size={24} />;
    
    const species = TREE_SPECIES.find(s => s.id === tree.species) || TREE_SPECIES[0];
    
    switch (species.icon) {
      case 'Flower2': return <Flower2 size={24} className={species.color} />;
      default: return <TreeIcon size={24} className={species.color} />;
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TreeIcon size={20} />
        Your Forest
      </h2>
      
      {trees.length === 0 ? (
        <div className="bg-white/30 border-2 border-dashed border-forest-green/20 rounded-3xl p-12 text-center">
          <Sprout className="mx-auto mb-4 text-forest-green/30" size={48} />
          <p className="text-earth-brown/50 font-medium">Your forest is empty. Plant your first tree to start!</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          <AnimatePresence initial={false}>
            {[...trees].reverse().map((tree) => (
              <motion.div
                key={tree.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`aspect-square rounded-xl flex items-center justify-center shadow-sm ${
                  tree.status === 'success' 
                    ? 'bg-forest-green/10 border border-forest-green/20' 
                    : 'bg-withered/10 text-withered border border-withered/20'
                }`}
                title={`${tree.duration}m focus session on ${new Date(tree.timestamp).toLocaleDateString()}`}
              >
                {getTreeIcon(tree)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
