export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

/**
 * Pre-measured intrinsic dimensions for project case study assets.
 * Specifying exact width, height, and CSS aspect-ratio prevents Cumulative Layout Shift (CLS)
 * and allows browsers to correctly calculate scroll positions and apply native lazy-loading.
 */
export const KNOWN_IMAGE_DIMENSIONS: Record<string, ImageDimensions> = {
  'croydon-cover.png': { width: 1172, height: 732, aspectRatio: '1172 / 732' },
  'croydon-cover.webp': { width: 1172, height: 732, aspectRatio: '1172 / 732' },
  'old-new.webp': { width: 1841, height: 836, aspectRatio: '1841 / 836' },
  'old-new.png': { width: 1841, height: 836, aspectRatio: '1841 / 836' },
  'logo-white.webp': { width: 1842, height: 690, aspectRatio: '1842 / 690' },
  'logo-white.png': { width: 1842, height: 690, aspectRatio: '1842 / 690' },
  'logo-black.webp': { width: 1841, height: 587, aspectRatio: '1841 / 587' },
  'logo-black.png': { width: 1841, height: 587, aspectRatio: '1841 / 587' },
  'font.webp': { width: 1841, height: 674, aspectRatio: '1841 / 674' },
  'font.png': { width: 1841, height: 674, aspectRatio: '1841 / 674' },
  'jersey.webp': { width: 1841, height: 1081, aspectRatio: '1841 / 1081' },
  'jersey.png': { width: 1841, height: 1081, aspectRatio: '1841 / 1081' },
  'other.webp': { width: 1841, height: 1395, aspectRatio: '1841 / 1395' },
  'other.png': { width: 1841, height: 1395, aspectRatio: '1841 / 1395' },
  'stories.webp': { width: 1841, height: 962, aspectRatio: '1841 / 962' },
  'stories.png': { width: 1841, height: 962, aspectRatio: '1841 / 962' },
};

export function getImageDimensions(url?: string): ImageDimensions | undefined {
  if (!url) return undefined;
  const clean = url.trim().replace(/\\/g, '/');
  const filename = clean.split('/').pop()?.split('?')[0]?.toLowerCase();
  if (filename && KNOWN_IMAGE_DIMENSIONS[filename]) {
    return KNOWN_IMAGE_DIMENSIONS[filename];
  }
  return undefined;
}

/**
 * Normalizes an image path to work reliably across dev server, Vite production build,
 * and GitHub Pages deployments with relative paths.
 */
export function resolveImageUrl(url?: string): string | undefined {
  if (!url) return undefined;

  // Preserve inline base64 data URLs, blobs, or external HTTP(S) links
  if (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Normalize paths such as:
  // - "public/images/croydon-cover.png"
  // - "/public/images/croydon-cover.png"
  // - "/images/croydon-cover.png"
  // - "./images/croydon-cover.png"
  // - "images/croydon-cover.png"
  let path = url.trim().replace(/\\/g, '/');
  if (path.startsWith('./')) path = path.slice(2);
  if (path.startsWith('/')) path = path.slice(1);
  if (path.startsWith('public/')) path = path.slice(7);
  if (path.startsWith('/')) path = path.slice(1);
  if (!path.startsWith('images/')) path = `images/${path}`;

  return `./${path}`;
}

