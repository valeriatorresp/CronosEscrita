import React from 'react';
import { Sparkles } from 'lucide-react';

export const GlobalSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf7fd] dark:bg-[#12071f] flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#1a0e2a] rounded-3xl p-8 shadow-2xl border border-[#ebdff2] dark:border-[#2d1b42] text-center animate-pulse">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#f2ebf8] dark:bg-[#251538] flex items-center justify-center text-[#6c2eb9] dark:text-[#a875ec]">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <div className="h-6 bg-[#f2ebf8] dark:bg-[#251538] rounded-lg w-3/4 mx-auto mb-3"></div>
        <div className="h-3 bg-[#f2ebf8] dark:bg-[#251538] rounded-md w-1/2 mx-auto mb-6"></div>

        <div className="space-y-3 pt-2">
          <div className="h-12 bg-[#f2ebf8] dark:bg-[#251538] rounded-xl w-full"></div>
          <div className="h-10 bg-[#f2ebf8] dark:bg-[#251538] rounded-xl w-5/6 mx-auto"></div>
        </div>

        <p className="text-[11px] text-[#8870a0] dark:text-[#9782ad] mt-6 tracking-wide uppercase font-semibold">
          Carregando CronosEscrita v1.0...
        </p>
      </div>
    </div>
  );
};
