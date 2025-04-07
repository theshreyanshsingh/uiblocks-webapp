'use client';
import React from 'react';
import { LuLoader } from 'react-icons/lu';

const AnimatedLine: React.FC = () => {
  return (
    <div className="px-3 p-2 bg-[#0F0F0F] relative overflow-hidden flex justify-center items-center rounded-lg space-x-2 border border-[#1c1b1b]">
      <LuLoader className="animate-spin text-white text-lg" />
      <p className="text-sm font-sans font-medium text-white">Waking up the container</p>
    </div>
  );
};

export default AnimatedLine;
