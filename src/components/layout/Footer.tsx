'use client';

import React from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-warm-100 py-12 text-slate-600 border-t border-warm-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-warm-300">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">DocuFlow</span>
              <span className="text-xs bg-white text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full font-mono">v1.4.0</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
              Enterprise-grade document utility engine built for high-performance client & edge processing.
              Manipulate, compress, and convert PDF, Office, and Image files with full privacy guarantees.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-purple-600" /> Client-Side Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-purple-600" /> Edge Engine
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" /> Zero File Retention
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">PDF Utilities</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><a href="#compress-pdf" className="hover:text-slate-950 transition-colors">Compress PDF</a></li>
              <li><a href="#merge-pdf" className="hover:text-slate-950 transition-colors">Merge PDFs</a></li>
              <li><a href="#split-pdf" className="hover:text-slate-950 transition-colors">Split PDF Pages</a></li>
              <li><a href="#rotate-pdf" className="hover:text-slate-950 transition-colors">Rotate PDF Pages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Converters</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><a href="#image-to-pdf" className="hover:text-slate-950 transition-colors">Images to PDF</a></li>
              <li><a href="#pdf-to-image" className="hover:text-slate-950 transition-colors">PDF to Images</a></li>
              <li><a href="#docx-to-pdf" className="hover:text-slate-950 transition-colors">Word to PDF</a></li>
              <li><a href="#pptx-to-pdf" className="hover:text-slate-950 transition-colors">PowerPoint to PDF</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} DocuFlow SaaS Platform. All processing performed with privacy guarantees.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Security Standards</span>
            <span className="hover:text-slate-900 cursor-pointer">API Specs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

