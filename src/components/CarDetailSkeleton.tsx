import React from 'react';
import { motion } from 'framer-motion';

export default function CarDetailSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container-max px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header (Mobile) */}
            <div className="lg:hidden space-y-3">
              <div className="h-4 bg-purple-900/20 rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-purple-900/20 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-purple-900/20 rounded w-1/3 animate-pulse" />
            </div>

            {/* Main Image Lightbox */}
            <div className="relative aspect-[16/10] md:aspect-video rounded-3xl overflow-hidden glass border border-purple-900/30">
              <div className="absolute inset-0 bg-purple-900/10 animate-pulse" />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 hidden-scrollbar">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative w-24 h-20 md:w-32 md:h-24 rounded-xl flex-shrink-0 glass border border-purple-900/30 overflow-hidden">
                  <div className="absolute inset-0 bg-purple-900/10 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Overview / Description */}
            <div className="glass rounded-3xl p-6 md:p-8 border border-purple-900/30 space-y-4">
              <div className="h-6 bg-purple-900/20 rounded w-1/4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-purple-900/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-purple-900/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-purple-900/10 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-purple-900/10 rounded w-4/6 animate-pulse" />
              </div>
            </div>

            {/* Specs Grid */}
            <div className="glass rounded-3xl p-6 md:p-8 border border-purple-900/30 space-y-6">
              <div className="h-6 bg-purple-900/20 rounded w-1/4 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-purple-900/5 border border-purple-900/10 flex flex-col gap-2">
                    <div className="h-4 bg-purple-900/10 rounded w-1/2 animate-pulse" />
                    <div className="h-5 bg-purple-900/20 rounded w-3/4 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & CTA */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 md:p-8 border border-purple-900/30 sticky top-28 space-y-6">
              {/* Header (Desktop) */}
              <div className="hidden lg:block space-y-3 pb-6 border-b border-purple-900/20">
                <div className="h-4 bg-purple-900/20 rounded w-1/3 animate-pulse" />
                <div className="h-8 bg-purple-900/20 rounded w-full animate-pulse" />
                <div className="h-6 bg-purple-900/20 rounded w-1/2 animate-pulse" />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="h-4 bg-purple-900/10 rounded w-1/4 animate-pulse" />
                <div className="h-10 bg-purple-900/20 rounded w-2/3 animate-pulse" />
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-4 border-t border-purple-900/20">
                <div className="h-14 bg-purple-900/20 rounded-xl w-full animate-pulse" />
                <div className="h-14 bg-purple-900/10 rounded-xl w-full animate-pulse" />
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3 pt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-900/20 animate-pulse flex-shrink-0" />
                    <div className="h-4 bg-purple-900/10 rounded w-3/4 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
