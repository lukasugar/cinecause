export interface Nonprofit {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  profileUrl?: string;
}

export async function searchNonprofits(searchTerm: string): Promise<Nonprofit[]> {
  const apiKey = process.env.EVERY_ORG_API_KEY;
  const searchApiBaseUrl = (
    process.env.EVERY_ORG_SEARCH_API_BASE_URL || 'https://partners.every.org'
  ).replace(/\/$/, '');

  if (!apiKey) {
    console.error('EVERY_ORG_API_KEY not set');
    return [];
  }

  try {
    const url = `${searchApiBaseUrl}/v0.2/search/${encodeURIComponent(searchTerm)}?apiKey=${apiKey}&take=10`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[every-org-api] search response:', JSON.stringify(data, null, 2));
    return data.nonprofits || [];
  } catch (error) {
    console.error('Failed to search nonprofits:', error);
    return [];
  }
}
