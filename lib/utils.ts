/**
 * Scrapes product metadata from a product URL.
 * Returns product name, brand, and image URL.
 * Falls back gracefully if scraping fails.
 */
export async function scrapeProduct(url: string): Promise<{
  product_name: string;
  brand_name: string;
  image_url: string;
}> {
  try {
    const response = await fetch(`/api/scrape-product?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Scrape failed');
    return await response.json();
  } catch {
    return { product_name: '', brand_name: '', image_url: '' };
  }
}

/**
 * Generates a URL-friendly slug from a name
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}