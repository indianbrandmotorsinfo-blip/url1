import type { UrlItem } from '../api/types';

export function sortUrls(items: UrlItem[]): UrlItem[] {
  return [...items].sort(
    (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || a.id - b.id,
  );
}

export function filterUrls(items: UrlItem[], query: string): UrlItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return items;
  }
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(needle) || item.description.toLowerCase().includes(needle),
  );
}

/** Adds https:// when the person types a bare domain such as "github.com". */
export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) {
    return value;
  }
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function monogram(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : '?';
}
