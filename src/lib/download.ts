/**
 * Universal Download Utility for DocuFlow Platform
 * Handles desktop browsers (Chrome, Firefox, Edge, Safari)
 * and mobile devices (iOS Safari, Android Chrome, WebViews).
 */

export interface DownloadOptions {
  fileName: string;
  blob: Blob;
  onFallbackNotice?: (msg: string) => void;
}

/**
 * Universal Blob Download Trigger
 */
export function downloadBlobUniversally({ fileName, blob, onFallbackNotice }: DownloadOptions) {
  if (typeof window === 'undefined') return;

  // 1. IE / Legacy Edge fallback
  if ((window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
    return;
  }

  // 2. Mobile User-Agent Detection (iOS Safari / Android Chrome / In-App WebViews)
  const userAgent = window.navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(userAgent);
  const isInAppWebView = /(FBAN|FBAV|Instagram|Line|Twitter|MicroMessenger)/i.test(userAgent);

  const objectUrl = window.URL.createObjectURL(blob);

  // 3. Mobile WebView / Safari fallback
  if (isInAppWebView) {
    if (onFallbackNotice) {
      onFallbackNotice('Opening document in new tab. Long press to save to files.');
    }
    const newTab = window.open(objectUrl, '_blank');
    if (!newTab) {
      window.location.href = objectUrl;
    }
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 10000);
    return;
  }

  // 4. Programmatic Invisible DOM Anchor Creation & Injection
  const link = document.createElement('a');
  link.style.display = 'none';
  link.style.position = 'absolute';
  link.style.left = '-9999px';
  link.href = objectUrl;
  link.download = fileName;

  // iOS Safari requires target="_blank" if download attribute is unsupported
  if (isIOS) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  document.body.appendChild(link);

  // 5. Trigger Click Event synchronously within user gesture callstack
  try {
    link.click();
  } catch (err) {
    // Fallback if direct click fails
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(clickEvent);
  }

  // 6. DOM Cleanup & Blob URL Revocation with buffer flush delay
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    window.URL.revokeObjectURL(objectUrl);
  }, 3000);
}

/**
 * Fetch API helper that consumes backend stream as .blob()
 * and triggers immediate local download using strict headers.
 */
export async function fetchAndDownloadApi(
  endpointUrl: string,
  formData: FormData,
  defaultFilename: string
): Promise<{ success: boolean; blob: Blob; fileName: string }> {
  const response = await fetch(endpointUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch (e) {
      // If error is raw text
    }
    throw new Error(errorMsg);
  }

  // Parse filename from Content-Disposition header if available
  let filename = defaultFilename;
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].trim();
    }
  }

  // Consume response as binary Blob stream
  const blob = await response.blob();

  // Execute universal local download
  downloadBlobUniversally({ fileName: filename, blob });

  return { success: true, blob, fileName: filename };
}
