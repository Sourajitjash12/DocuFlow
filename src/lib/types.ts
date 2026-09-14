export type ToolCategory = 'pdf-toolkit' | 'converters' | 'image-tools';

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: string;
  badge?: string;
  acceptedTypes: string[];
  maxFiles: number;
  featured?: boolean;
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  pageCount?: number;
  rotation?: number;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface ProcessingResult {
  blob: Blob;
  fileName: string;
  mimeType: string;
  originalSize: number;
  processedSize: number;
  compressionRatio?: number;
}

export interface CompressionSettings {
  level: 'low' | 'medium' | 'high';
  dpi: number;
  removeAnnotations: boolean;
}

export type DimensionPreset = 'a4' | 'a5' | 'letter' | 'a3' | 'legal' | 'fit' | 'custom';

export type PaperSizePreset = 'a4' | 'a5' | 'letter' | 'legal' | 'fit' | 'custom';

export type MarginPreset = 'none' | 'compact' | 'standard' | 'wide' | 'custom';

export type QualityMode = 'high' | 'balanced' | 'max_compression';

export type BackgroundType = 'white' | 'black' | 'transparent' | 'custom';

export interface MarginBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageLayoutConfig {
  paperSize: PaperSizePreset;
  marginPreset: MarginPreset;
  margins: MarginBounds;
  orientation: 'portrait' | 'landscape' | 'auto';
  qualityMode: QualityMode;
  qualityPercentage: number; // 1 to 100%
  scaleFactor: number;
  customWidth?: number; // width in points (1 pt = 1/72 inch)
  customHeight?: number; // height in points
  maintainAspectRatio?: boolean;
  backgroundType: BackgroundType;
  backgroundColor?: string; // hex color string e.g. '#ffffff'
}

export interface DimensionScalingConfig {
  preset: DimensionPreset;
  scaleFactor: number; // multiplier, e.g., 0.5 for 50%, 1.0 for 100%, 1.5 for 150%
  customWidth?: number; // width in points (1 pt = 1/72 inch)
  customHeight?: number; // height in points
  maintainAspectRatio?: boolean;
}

export interface MergeSettings {
  includePageNumbers: boolean;
  addBookmarks: boolean;
}


