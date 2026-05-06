import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UPDATES = [
  "Implementing Qualifier Phase: 10 teams, 4 matches each...",
  "Integrating League System: 6 core teams + 2 qualifiers...",
  "Refining Semifinal logic for robust fixtures...",
  "Updating User Interface for Broadcaster clarity...",
  "Optimizing Simulation Speed and Aggression impact...",
  "Finalizing Version v.0.0.1.1 Early Access..."
];

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < UPDATES.length) {
      const timer = setTimeout(() => setIndex(i => i + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete]);

  return (
    <div className="fixed inset-0 bg-charcoal-950 flex flex-col items-center justify-center p-8 z-[100]">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1)_0%,transparent_70%)]" />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-brand-teal rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.4)] mb-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
        <span className="text-black font-black text-5xl italic relative z-10">SC</span>
      </motion.div>

      <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: `${(index / UPDATES.length) * 100}%` }}
          className="h-full bg-brand-teal shadow-[0_0_15px_rgba(20,184,166,0.6)]"
        />
      </div>

      <div className="h-12 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex flex-col items-center"
          >
            <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.5em] mb-2">INITIALIZING_UPDATES</span>
            <p className="text-sm font-black italic text-white/60 text-center uppercase tracking-tight">
              {UPDATES[index] || "Ready to Start!"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-12 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
        v.0.0.1.1 EA // STABLE_BUILD
      </div>
    </div>
  );
};
