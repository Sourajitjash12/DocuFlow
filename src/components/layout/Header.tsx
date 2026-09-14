'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Brand Logo - Squircle with icon */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-transform group-hover:scale-105">
            <svg
              className="h-6 w-6 text-white fill-current"
              viewBox="0 0 24 24"
            >
              <rect x="4" y="4" width="16" height="16" rx="5" fill="currentColor" opacity="0.9"/>
              <circle cx="12" cy="12" r="3" fill="#faf2ed" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DocuFlow</span>
        </Link>

        {/* Navigation Links - Centered */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <Link href="#how-it-works" className="hover:text-slate-950 transition-colors">
            How it works
          </Link>
          <Link href="#use-cases" className="hover:text-slate-950 transition-colors">
            Use cases
          </Link>
          <Link href="#features" className="hover:text-slate-950 transition-colors">
            Features
          </Link>
          <Link href="#faq" className="hover:text-slate-950 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right Action Icons - Circular buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 border border-stone-200/80 shadow-subtle hover:bg-stone-50 hover:text-slate-950 transition-all"
            aria-label="User Account"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 border border-stone-200/80 shadow-subtle hover:bg-stone-50 hover:text-slate-950 transition-all"
            aria-label="Sign In"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

