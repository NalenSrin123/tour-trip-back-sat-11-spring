import React, { useEffect } from 'react';

export const SITE_NAME = 'Tour Trip';
export const SITE_URL = 'https://tour-trip-web.vercel.app';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION =
  'Book unforgettable guided tours across Angkor Wat temples, royal palaces, pristine islands and hidden gems in Cambodia.';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: 'website' | 'article';
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Lightweight, dependency-free document head manager. Updates the page title and
 * Open Graph / Twitter meta tags so each route (tour, destination, etc.) gets its
 * own preview when shared on Google, Telegram, Messenger or WhatsApp.
 */
export const Seo: React.FC<SeoProps> = ({ title, description, image, url, type = 'website' }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Discover Cambodia & Beyond`;
  const desc = description?.trim() || DEFAULT_DESCRIPTION;
  const img = image && image.startsWith('http') ? image : DEFAULT_OG_IMAGE;
  const pageUrl =
    url || (typeof window !== 'undefined' ? `${SITE_URL}${window.location.pathname}` : SITE_URL);

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:url', pageUrl);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', img);
  }, [fullTitle, desc, img, pageUrl, type]);

  return null;
};
