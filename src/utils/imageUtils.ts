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

  return `./${path}`;
}
