import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TenPerfectThings/1.0)',
      },
      signal: AbortSignal.timeout(8000),
    });

    const html = await response.text();

    const ogTitle = extractMeta(html, 'og:title') || extractTitle(html);
    const ogImage = extractMeta(html, 'og:image');
    const ogSiteName = extractMeta(html, 'og:site_name');
    const brandFromDomain = extractBrandFromUrl(url);

    let productName = ogTitle || '';
    if (ogSiteName && productName.includes(ogSiteName)) {
      productName = productName.replace(new RegExp(`[|\\-–—]?\\s*${ogSiteName}\\s*$`, 'i'), '').trim();
    }

    return NextResponse.json({
      product_name: productName,
      brand_name: ogSiteName || brandFromDomain,
      image_url: ogImage || '',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product', product_name: '', brand_name: '', image_url: '' },
      { status: 200 }
    );
  }
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return '';
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : '';
}

function extractBrandFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const brandMap: Record<string, string> = {
      'jcrew.com': 'J. Crew',
      'net-a-porter.com': 'Net-a-Porter',
      'mrporter.com': 'Mr Porter',
      'ssense.com': 'SSENSE',
      'farfetch.com': 'Farfetch',
      'nordstrom.com': 'Nordstrom',
      'versace.com': 'Versace',
      'tomford.com': 'Tom Ford',
      'acnestudios.com': 'Acne Studios',
      'driesvannoten.com': 'Dries Van Noten',
      'levi.com': "Levi's",
      'golashoes.com': 'Gola',
      'imogeneandwillie.com': 'Imogene + Willie',
    };
    return brandMap[domain] || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch {
    return '';
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}