'use client';
import { motion } from 'framer-motion';

export function PageLoader() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-background">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="w-12 h-12 border-4 border-muted rounded-full border-t-primary"
      />
    </div>
  );
}
