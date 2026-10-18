import { API_URL } from './client';

export const extractData = (res: any) => {
  if (!res?.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (res.data.content && Array.isArray(res.data.content)) return res.data.content;
  return [];
};

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
      '<rect width="100%" height="100%" fill="#e5e7eb"/>' +
      '<path d="M150 120l30 40 22-26 38 46H160l-10-60z" fill="#cbd5e1"/>' +
      '<circle cx="255" cy="110" r="16" fill="#cbd5e1"/>' +
      '<text x="50%" y="82%" font-family="sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">No image</text>' +
    '</svg>'
  );

export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('blob:')) return url;
  return `${API_URL}${url}`;
};

export const getTourImageUrl = (tour: any, index: number = 0): string => {
  const imgs = tour?.images;
  if (!imgs || !Array.isArray(imgs) || imgs.length === 0) {
    return PLACEHOLDER_IMAGE;
  }
  const img = imgs[index] || imgs[0];
  if (typeof img === 'string') return resolveImageUrl(img);
  if (img && typeof img === 'object') {
    const url = (img as any).imageUrl || (img as any).url || '';
    return resolveImageUrl(url);
  }
  return PLACEHOLDER_IMAGE;
};
