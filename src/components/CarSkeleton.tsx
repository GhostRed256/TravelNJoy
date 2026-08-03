import React from 'react';
import { motion } from 'framer-motion';

export default function CarSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass overflow-hidden rounded-2xl border border-purple-900/30 flex flex-col h-full bg-[#0a0a0a]/60"
    >
      {/* Image Skeleton */}
      <div className="relative h-56 w-full bg-purple-900/10 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Header (Make, Model, Year, Price) */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-purple-900/20 rounded-md w-3/4 animate-pulse" />
            <div className="h-4 bg-purple-900/10 rounded-md w-1/4 animate-pulse" />
          </div>
          <div className="h-8 bg-purple-900/20 rounded-lg w-24 animate-pulse shrink-0" />
        </div>

        {/* Info Pills */}
        <div className="flex gap-2 mb-2">
          <div className="h-6 w-16 bg-purple-900/10 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-purple-900/10 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-purple-900/10 rounded-full animate-pulse" />
        </div>

        {/* Footer (Location, ID) */}
        <div className="mt-auto pt-4 border-t border-purple-900/20 flex justify-between items-center">
          <div className="h-4 w-20 bg-purple-900/10 rounded-md animate-pulse" />
          <div className="h-4 w-12 bg-purple-900/10 rounded-md animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
