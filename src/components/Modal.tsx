import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  type?: 'danger' | 'info' | 'success';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  type = 'info'
}) => {
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
            className="relative bg-soft-cream w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-white/50"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-earth-brown">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-earth-brown/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="text-earth-brown/70 mb-8">
                {children}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-earth-brown/60 hover:bg-earth-brown/5 transition-colors"
                >
                  Cancel
                </button>
                {onConfirm && (
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors shadow-lg ${
                      type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                      type === 'success' ? 'bg-forest-green hover:bg-forest-green/90 shadow-forest-green/20' :
                      'bg-forest-green hover:bg-forest-green/90 shadow-forest-green/20'
                    }`}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
