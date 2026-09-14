import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { downloadBlobUniversally } from './download';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Universal Download Wrapper
 */
export function downloadBlob(blob: Blob, fileName: string) {
  downloadBlobUniversally({ fileName, blob });
}

export function validateFiles(
  files: File[],
  acceptedMimeTypes: string[],
  maxSizeBytes: number = 50 * 1024 * 1024
): { valid: File[]; errors: string[] } {
  const valid: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (file.size > maxSizeBytes) {
      errors.push(`"${file.name}" exceeds the maximum allowed size of ${formatBytes(maxSizeBytes)}.`);
      continue;
    }

    if (acceptedMimeTypes.length > 0) {
      const isWildcard = acceptedMimeTypes.some(t => t.endsWith('/*') && file.type.startsWith(t.slice(0, -2)));
      const isExactMatch = acceptedMimeTypes.includes(file.type);
      const isExtensionMatch = acceptedMimeTypes.some(t => file.name.toLowerCase().endsWith(t.replace('*', '')));

      if (!isWildcard && !isExactMatch && !isExtensionMatch) {
        errors.push(`"${file.name}" has an unsupported file format (${file.type || 'unknown'}).`);
        continue;
      }
    }

    valid.push(file);
  }

  return { valid, errors };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
