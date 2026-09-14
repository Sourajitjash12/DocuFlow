'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Layers,
  FileText,
  Image as ImageIcon,
  FileCode,
  ArrowRightLeft,
  Search,
  Zap,
  Lock,
  Sparkles,
  CheckCircle,
  Sliders,
  Presentation,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { PdfCompressor } from '@/components/tools/PdfCompressor';
import { PdfMerger } from '@/components/tools/PdfMerger';
import { ImageToPdf } from '@/components/tools/ImageToPdf';
import { DocxToPdf } from '@/components/tools/DocxToPdf';
import { PdfToDocx } from '@/components/tools/PdfToDocx';
import { PdfToImage } from '@/components/tools/PdfToImage';
import { PptxToPdf } from '@/components/tools/PptxToPdf';
import { PdfToPpt } from '@/components/tools/PdfToPpt';
import { ImageCompressor } from '@/components/tools/ImageCompressor';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingSections } from '@/components/landing/LandingSections';

interface ToolItem {
  id: string;
  name: string;
  category: 'pdf' | 'converter' | 'image';
  description: string;
  badge?: string;
  icon: any;
  popular?: boolean;
}

const TOOLS: ToolItem[] = [
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    category: 'pdf',
    description: 'Reduce PDF file size while retaining document crispness & stream quality.',
    badge: 'POPULAR',
    icon: Sliders,
    popular: true,
  },
  {
    id: 'compress-image',
    name: 'Compress Image',
    category: 'image',
    description: 'Compress PNG, JPG, and WebP images with safe margins, Lanczos3 filtering & quality controls.',
    badge: 'NEW',
    icon: Sliders,
    popular: true,
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDFs',
    category: 'pdf',
    description: 'Combine multiple PDF files into a single unified document with custom reordering.',
    badge: 'ESSENTIAL',
    icon: Layers,
    popular: true,
  },
  {
    id: 'image-to-pdf',
    name: 'Images to PDF',
    category: 'image',
    description: 'Convert PNG, JPG, and WebP images into formatted multi-page PDF documents.',
    badge: 'FAST',
    icon: ImageIcon,
    popular: true,
  },
  {
    id: 'docx-to-pdf',
    name: 'Word to PDF',
    category: 'converter',
    description: 'Convert Microsoft Word (.docx) documents into clean PDF files.',
    badge: '2-WAY',
    icon: FileText,
  },
  {
    id: 'pdf-to-docx',
    name: 'PDF to Word',
    category: 'converter',
    description: 'Extract text & layout from PDF documents into editable Word (.docx) files.',
    badge: '2-WAY',
    icon: FileCode,
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Images',
    category: 'image',
    description: 'Extract high-resolution PNG or JPG image files from PDF pages.',
    icon: ArrowRightLeft,
  },
  {
    id: 'pptx-to-pdf',
    name: 'PowerPoint to PDF',
    category: 'converter',
    description: 'Convert PowerPoint presentations (.pptx) into multi-slide PDF documents.',
    icon: Presentation,
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    category: 'converter',
    description: 'Convert PDF document pages into editable PowerPoint presentation slides (.pptx).',
    badge: 'NEW',
    icon: Presentation,
  },
];

export default function DashboardPage() {
  const [activeToolId, setActiveToolId] = useState<string>('compress-pdf');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pdf' | 'converter' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeTool = useMemo(() => {
    return TOOLS.find((t) => t.id === activeToolId) || TOOLS[0];
  }, [activeToolId]);

  return (
    <div className="min-h-screen bg-warm-100 text-slate-900 p-2 sm:p-4 lg:p-6 font-sans">
      
      {/* MAIN CONTAINER CARD WRAPPER WITH ROUNDED SQUIRCLE EDGES */}
      <div className="mx-auto max-w-[1400px] rounded-[32px] sm:rounded-[40px] bg-warm-50 border border-warm-300 shadow-card overflow-hidden">
        
        {/* HERO SECTION */}
        <HeroSection
          onStartClick={() => {
            document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* TOOLS WORKSPACE SECTION */}
        <div id="tools" className="scroll-mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 py-12 border-t border-warm-300">
          
          {/* Section Heading & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Document Manipulation Workspace
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Select a document utility below to compress, merge, or convert files with 100% privacy.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-80">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-stone-200/90 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-subtle"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tool Category Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-warm-300 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Utilities' },
                { id: 'pdf', label: 'PDF Toolkit' },
                { id: 'converter', label: 'Office Converters' },
                { id: 'image', label: 'Image Tools' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === tab.id
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-stone-100 border border-stone-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-medium text-slate-500">
              Showing <span className="font-semibold text-slate-900">{filteredTools.length}</span> tools
            </div>
          </div>

          {/* Tools Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === activeToolId;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    setActiveToolId(tool.id);
                    const el = document.getElementById('active-tool-workspace');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative flex flex-col justify-between rounded-3xl border p-6 transition-all cursor-pointer ${
                    isActive
                      ? 'border-purple-500 bg-white ring-2 ring-purple-500/20 shadow-card'
                      : 'border-stone-200/80 bg-white hover:border-purple-300 hover:shadow-card'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                          isActive
                            ? 'border-purple-200 bg-purple-50 text-purple-600'
                            : 'border-stone-200/80 bg-warm-100 text-slate-900 group-hover:border-purple-200 group-hover:bg-purple-50 group-hover:text-purple-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {tool.badge && (
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider border border-stone-200">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors flex items-center gap-1">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] font-semibold">
                    <span className={isActive ? 'text-purple-600 font-bold' : 'text-slate-400'}>
                      {isActive ? 'Currently Active' : 'Select Tool'}
                    </span>
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isActive ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Tool Execution Container */}
          <section id="active-tool-workspace" className="pt-6 scroll-mt-20">
            <div className="rounded-[32px] border border-warm-300 bg-white p-6 sm:p-10 shadow-card space-y-8">
              
              {/* Header banner of current active tool */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                    {React.createElement(activeTool.icon, { className: 'h-6 w-6 text-purple-400' })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{activeTool.name}</h2>
                      {activeTool.badge && (
                        <span className="rounded-full bg-purple-50 px-3 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-100">
                          {activeTool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{activeTool.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-warm-50 border border-warm-300 px-3.5 py-1.5 rounded-full">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Zero Server File Retention</span>
                </div>
              </div>

              {/* Dynamic Active Tool Renderer */}
              <div>
                {activeToolId === 'compress-pdf' && <PdfCompressor />}
                {activeToolId === 'compress-image' && <ImageCompressor />}
                {activeToolId === 'merge-pdf' && <PdfMerger />}
                {activeToolId === 'image-to-pdf' && <ImageToPdf />}
                {activeToolId === 'docx-to-pdf' && <DocxToPdf />}
                {activeToolId === 'pdf-to-docx' && <PdfToDocx />}
                {activeToolId === 'pdf-to-image' && <PdfToImage />}
                {activeToolId === 'pptx-to-pdf' && <PptxToPdf />}
                {activeToolId === 'pdf-to-ppt' && <PdfToPpt />}
              </div>
            </div>
          </section>

        </div>

        {/* INTERACTIVE LANDING SECTIONS (How it works, Use cases, Features, FAQ) */}
        <LandingSections />

      </div>
    </div>
  );
}

