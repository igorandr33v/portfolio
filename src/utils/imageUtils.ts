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
  'cover.webp': { width: 1172, height: 732, aspectRatio: '1172 / 732' },
  'cover.png': { width: 1172, height: 732, aspectRatio: '1172 / 732' },
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
  'renderia.webp': { width: 1743, height: 1255, aspectRatio: '1743 / 1255' },
  'your-pizza.webp': { width: 3257, height: 1255, aspectRatio: '3257 / 1255' },
  'ukniu-buklet.webp': { width: 3284, height: 1255, aspectRatio: '3284 / 1255' },
  'cdek.webp': { width: 3359, height: 1255, aspectRatio: '3359 / 1255' },
  'menu-coffee.webp': { width: 934, height: 1255, aspectRatio: '934 / 1255' },
  'jazz.webp': { width: 931, height: 1255, aspectRatio: '931 / 1255' },
  'your-real-side.webp': { width: 3101, height: 1255, aspectRatio: '3101 / 1255' },
  'cvetmet.webp': { width: 699, height: 1255, aspectRatio: '699 / 1255' },
  'holistima.webp': { width: 3312, height: 1255, aspectRatio: '3312 / 1255' },
  'renderia-1.webp': { width: 1614, height: 1127, aspectRatio: '1614 / 1127' },
  'your-pizza-1.webp': { width: 3128, height: 1127, aspectRatio: '3128 / 1127' },
  'ukniu-buklet-1.webp': { width: 3156, height: 1127, aspectRatio: '3156 / 1127' },
  'cdek-1.webp': { width: 3217, height: 1115, aspectRatio: '3217 / 1115' },
  'menu-coffee-1.webp': { width: 805, height: 1127, aspectRatio: '805 / 1127' },
  'jazz-1.webp': { width: 803, height: 1127, aspectRatio: '803 / 1127' },
  'your-real-side-1.webp': { width: 2972, height: 1127, aspectRatio: '2972 / 1127' },
  'holistima-1.webp': { width: 3183, height: 1127, aspectRatio: '3183 / 1127' },
  'atlanta.webp': { width: 370, height: 276, aspectRatio: '370 / 276' },
  'container.webp': { width: 305, height: 296, aspectRatio: '305 / 296' },
  'dobry-gorod.webp': { width: 284, height: 238, aspectRatio: '284 / 238' },
  'opora.webp': { width: 507, height: 172, aspectRatio: '507 / 172' },
  'smysly.webp': { width: 506, height: 171, aspectRatio: '506 / 171' },
  'sovet-nygani.webp': { width: 506, height: 171, aspectRatio: '506 / 171' },
  'group-vk.webp': { width: 1604, height: 812, aspectRatio: '1604 / 812' },
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

