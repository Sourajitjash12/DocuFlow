'use client';

import React from 'react';
import { ArrowRight, Star, Sparkles, CheckCircle2, Pause, Volume2, Shield } from 'lucide-react';

interface HeroSectionProps {
  onStartClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartClick }) => {
  return (
    <section className="relative w-full pt-8 pb-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: Hero Copy & Actions */}
          <div className="lg:col-span-6 space-y-8 text-left z-10">
            {/* Main Gradient Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              <span className="text-gradient-hero block pb-1">PDF compression</span>
              <span>for real-time</span>
              <span className="block">documents</span>
            </h1>

            {/* Sub-headline description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              DocuFlow optimizes your PDF files, reduces stream overhead, and provides real-time size reduction & live vector quality — all without taking manual effort or storing files.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary Pill Button with Gradient */}
              <button
                type="button"
                onClick={onStartClick || (() => {
                  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                })}
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-btn px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4 text-white" />
                </span>
                <span>Start for free</span>
              </button>
            </div>

            {/* Bullet list under CTAs */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-500 pt-2">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                100% Free forever
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500"></span>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                Zero file retention
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Visual Mockup & Floating Cards */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* SVG Connector Lines background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 500 500"
              fill="none"
            >
              {/* Curved line connecting top left thumbnail to central card */}
              <path
                d="M 100 120 Q 180 180 250 200"
                stroke="url(#gradient-line)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <defs>
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing Gradient Node Circle on Curve */}
            <div className="absolute top-[185px] left-[130px] z-20 hidden sm:flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-r from-purple-500 to-orange-400 p-0.5 shadow-md animate-pulse-glow">
              <div className="h-full w-full bg-white rounded-full flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              </div>
            </div>

            {/* Top-Right Floating Rating Badge */}
            <div className="absolute -top-4 right-2 sm:right-6 z-30 flex items-center gap-2.5 rounded-full bg-white/95 backdrop-blur-md px-4 py-2 shadow-card border border-stone-200/70 text-xs font-semibold text-slate-800">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-600">
                <Star className="h-3.5 w-3.5 fill-purple-600 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500 font-bold">★ ★ ★ ★ ★</span>
                  <span className="font-extrabold text-slate-900 text-xs">5.0/5.0</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">#1 Rated • 6,000+ Reviews</span>
              </div>
            </div>

            {/* Floating Thumbnail Card 1: Top-Left (Document / Avatar Preview) */}
            <div className="absolute -top-2 left-0 sm:left-4 z-20 h-20 w-32 sm:h-24 sm:w-36 rounded-2xl overflow-hidden border-2 border-white shadow-card bg-slate-900 animate-float-slow">
              <div className="relative h-full w-full bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-700/50">PDF</span>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <Volume2 className="h-3 w-3 text-slate-300" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center text-[10px] text-white font-bold">
                    JD
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 truncate">Report_2026</span>
                </div>
              </div>
            </div>

            {/* Floating Thumbnail Card 2: Top-Right */}
            <div className="absolute top-12 -right-2 sm:right-0 z-20 h-20 w-28 sm:h-24 sm:w-32 rounded-2xl overflow-hidden border-2 border-white shadow-card bg-stone-900 animate-float-delayed">
              <div className="relative h-full w-full bg-gradient-to-br from-amber-900/60 via-slate-900 to-stone-900 p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-end">
                  <Volume2 className="h-3 w-3 text-amber-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-[10px] text-amber-200 font-bold">
                    SK
                  </div>
                  <span className="text-[11px] font-medium text-stone-200 truncate">Contract.pdf</span>
                </div>
              </div>
            </div>

            {/* MAIN CENTRAL MOCKUP CARD (Phone / Device Container) */}
            <div className="relative z-10 w-[270px] sm:w-[310px] rounded-[32px] bg-slate-950 text-white p-5 shadow-elevated border border-slate-800 space-y-4 my-8">
              
              {/* Header inside central mockup */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-semibold text-sm text-slate-100 tracking-tight">End-of-Sprint Report</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    Smart Vector Compression
                  </p>
                </div>
                <button type="button" className="text-slate-400 hover:text-white text-xs font-bold">···</button>
              </div>

              {/* Waveform / Audio Visualizer Bar */}
              <div className="flex items-center justify-center gap-1 py-3 bg-slate-900/70 rounded-xl px-3 border border-slate-800/50">
                {[40, 65, 30, 85, 95, 45, 70, 100, 60, 40, 80, 90, 50, 30, 75, 55, 90, 40].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-gradient-to-t from-purple-500 to-orange-400 rounded-full transition-all duration-300"
                    style={{ height: `${h * 0.28}px` }}
                  ></span>
                ))}
              </div>

              {/* Compression Timer & Progress Pill */}
              <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3.5 py-2 text-xs border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  00:05:39
                </div>
                <div className="flex items-center gap-1.5 font-medium text-pink-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analysing...</span>
                </div>
              </div>

              {/* FLOATING SPEECH / INSIGHT OVERLAY CARD */}
              <div className="relative -mx-2 bg-white text-slate-900 rounded-2xl p-4 shadow-elevated border border-stone-200/90 space-y-2 z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-600 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
                      C
                    </div>
                    <span className="font-bold text-xs text-slate-900">Conrad</span>
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                      ⚡ 05:45
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-snug">
                  The only thing left is to get the final compressed document, and start sharing!
                </p>
              </div>

              {/* Additional Mockup text preview */}
              <div className="space-y-2 pt-1 text-[11px] text-slate-400 leading-relaxed px-1">
                <p className="font-semibold text-slate-300">Perfect. Any blockers on your side, Liam?</p>
                <p className="text-[10px] text-slate-500">Sofia 04:34</p>
                <p className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                  Go with the compressed variant. The thick one is only for local storage; mobile uses the lighter style.
                </p>
              </div>

              {/* Bottom Central Player Control Pill */}
              <div className="flex justify-center pt-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 text-white border border-slate-700 shadow-md hover:scale-105 transition-transform cursor-pointer">
                  <Pause className="h-4 w-4 fill-white" />
                </div>
              </div>
            </div>

            {/* Floating Thumbnail Card 3: Bottom-Left */}
            <div className="absolute -bottom-4 left-2 sm:left-6 z-20 h-20 w-32 sm:h-24 sm:w-36 rounded-2xl overflow-hidden border-2 border-white shadow-card bg-slate-900 animate-float-delayed">
              <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-stone-900 to-indigo-950 p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-end">
                  <Volume2 className="h-3 w-3 text-purple-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/30 border border-indigo-400 flex items-center justify-center text-[10px] text-indigo-200 font-bold">
                    MR
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 truncate">Portfolio_v2</span>
                </div>
              </div>
            </div>

            {/* Floating Thumbnail Card 4: Bottom-Right */}
            <div className="absolute bottom-2 -right-2 sm:right-2 z-20 h-20 w-28 sm:h-24 sm:w-32 rounded-2xl overflow-hidden border-2 border-white shadow-card bg-slate-900 animate-float-slow">
              <div className="relative h-full w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-end">
                  <Volume2 className="h-3 w-3 text-emerald-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[10px] text-emerald-200 font-bold">
                    AL
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 truncate">Invoice_09.pdf</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
