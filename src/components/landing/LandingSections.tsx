'use client';

import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Layers,
  FileCheck,
  CheckCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Sliders,
  Cpu,
  Lock,
  Check,
} from 'lucide-react';

export const LandingSections: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'business' | 'ebooks' | 'scans' | 'design'>('business');

  const faqs = [
    {
      q: 'How does DocuFlow reduce PDF file sizes without quality loss?',
      a: 'DocuFlow inspects internal PDF stream structures, compresses uncompressed vector tables, compresses raster images using Lanczos3 spatial scaling, and strips unused fonts & redundant metadata objects while preserving pristine text rendering.',
    },
    {
      q: 'Are my PDF files uploaded or stored on your servers?',
      a: 'No. All PDF processing occurs directly in-memory with automatic zero-retention memory purge. Your confidential documents never hit disk storage.',
    },
    {
      q: 'Is there a file size limit for PDF compression?',
      a: 'DocuFlow supports files up to 200 MB per document with instant batch processing directly in your browser.',
    },
    {
      q: 'Can I compress PDF documents on mobile devices?',
      a: 'Yes! DocuFlow is fully optimized for desktop, tablet, and mobile browsers with identical speed and feature parity.',
    },
  ];

  return (
    <div className="space-y-24 py-12">
      
      {/* SECTION 1: HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/80 px-4 py-1 text-xs font-semibold text-purple-700 shadow-subtle">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>3-Step Automated Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How DocuFlow works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Compress your PDF files in seconds with zero configuration required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Upload or Drop PDF',
              desc: 'Select or drop your PDF document into our secure in-memory workspace.',
              icon: FileCheck,
            },
            {
              step: '02',
              title: 'Choose Compression',
              desc: 'Select low, medium, or high compression streams and page margin presets.',
              icon: Sliders,
            },
            {
              step: '03',
              title: 'Instant Download',
              desc: 'Get your lightweight, vector-crisp PDF document ready for email or upload.',
              icon: Zap,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl bg-white p-8 border border-stone-200/80 shadow-card hover:shadow-elevated transition-all space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="font-mono text-2xl font-black text-slate-300">{item.step}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: USE CASES */}
      <section id="use-cases" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-blush-50 border border-warm-300 p-8 sm:p-12 space-y-10">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for every workflow
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Tailored compression engines optimized for reports, e-books, scans, and design files.
            </p>
          </div>

          {/* Use cases tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'business', label: 'Business Reports' },
              { id: 'ebooks', label: 'E-Books & Manuals' },
              { id: 'scans', label: 'Scanned Documents' },
              { id: 'design', label: 'Design Portfolios' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-stone-100 border border-stone-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content display */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-300 shadow-subtle grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                {activeTab === 'business' && 'Compress Business & Legal Reports by up to 85%'}
                {activeTab === 'ebooks' && 'Optimize E-Books for Instant Mobile Reading'}
                {activeTab === 'scans' && 'Clean & Shrink High-Res Scanned Receipts'}
                {activeTab === 'design' && 'Maintain Crisp Vector Graphics in Portfolios'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ensure your documents meet strict email attachment limits and portal upload limits without sacrificing clarity or formatting.
              </p>
              <div className="space-y-2 pt-2">
                {['Automatic stream compression', 'Font subsetting included', 'Lossless text preservation'].map(
                  (feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>{feat}</span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-3">
                <span className="text-purple-400">Quarterly_Report_2026.pdf</span>
                <span className="text-emerald-400 font-bold">-82% Reduced</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400">Original Size</p>
                  <p className="text-sm font-bold text-slate-200 mt-1">15.4 MB</p>
                </div>
                <div className="bg-purple-950/60 p-3 rounded-lg border border-purple-700/50">
                  <p className="text-[10px] text-purple-300">Compressed Size</p>
                  <p className="text-sm font-bold text-purple-200 mt-1">2.7 MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES GRID */}
      <section id="features" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/80 px-4 py-1 text-xs font-semibold text-orange-700 shadow-subtle">
            <Cpu className="h-3.5 w-3.5 text-orange-600" />
            <span>High-Performance Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered for speed & privacy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Lanczos3 Image Downscaling',
              desc: 'Advanced spatial filter resizes embedded raster images without blurring.',
              icon: Sliders,
            },
            {
              title: 'Client In-Memory Execution',
              desc: 'Files are processed strictly in RAM with zero storage retention.',
              icon: Lock,
            },
            {
              title: 'Vector Text Preservation',
              desc: 'Text elements remain 100% vector scalable at high zoom levels.',
              icon: Layers,
            },
            {
              title: 'Page Margin Safe Bounds',
              desc: 'Configure custom print safe margins before file compression.',
              icon: Shield,
            },
            {
              title: 'Multi-Format Converters',
              desc: 'Convert Word, PowerPoint, and Image files to and from PDF.',
              icon: Sparkles,
            },
            {
              title: 'Instant Batch Download',
              desc: 'Process single or multiple documents seamlessly in one click.',
              icon: Zap,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white p-7 border border-stone-200/80 shadow-subtle hover:shadow-card transition-all space-y-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warm-100 text-slate-900 border border-warm-300">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: FAQ ACCORDION */}
      <section id="faq" className="scroll-mt-24 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to know about PDF compression and privacy.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-stone-200/80 shadow-subtle overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 text-base sm:text-lg hover:text-purple-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-purple-600' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
