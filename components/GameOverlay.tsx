import React from 'react';

interface GameOverlayProps {
  children: React.ReactNode;
  show: boolean;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ children, show }) => {
  // Access the global variable inside the component render function
  // to ensure the CDN script has had time to load.
  const Framer = (window as any).FramerMotion;

  // If the library hasn't loaded, render a non-animated fallback.
  if (!Framer) {
    if (!show) return null;
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
        <div className="bg-galaxy-start/80 backdrop-blur-md text-white p-8 rounded-2xl shadow-2xl text-center border border-white/10">
          {children}
        </div>
      </div>
    );
  }

  const { motion, AnimatePresence } = Framer;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-galaxy-start/80 backdrop-blur-md text-white p-8 rounded-2xl shadow-2xl text-center border border-white/10"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};