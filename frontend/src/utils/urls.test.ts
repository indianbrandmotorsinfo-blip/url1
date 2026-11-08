import { describe, expect, it } from 'vitest';
import type { UrlItem } from '../api/types';
import { filterUrls, isValidHttpUrl, monogram, normalizeUrl, sortUrls } from './urls';

const items: UrlItem[] = [
  { id: 1, name: 'Grafana', url: 'https://grafana.example.com', description: 'Dashboards' },
  { id: 2, name: 'GitHub', url: 'https://github.com', description: 'Source code repository' },
  { id: 3, name: 'argocd', url: 'https://argo.example.com', description: 'GitOps deployments' },
];

describe('filterUrls', () => {
  it('returns everything for an empty query', () => {
    expect(filterUrls(items, '   ')).toHaveLength(3);
  });

  it('matches the name, ignoring case', () => {
    expect(filterUrls(items, 'GIT').map((i) => i.id)).toEqual([2, 3]);
  });

  it('matches the description', () => {
    expect(filterUrls(items, 'dashboards').map((i) => i.id)).toEqual([1]);
  });

  it('returns nothing when there is no match', () => {
    expect(filterUrls(items, 'jenkins')).toEqual([]);
  });
});

describe('sortUrls', () => {
  it('sorts by name without caring about case and keeps the input untouched', () => {
    expect(sortUrls(items).map((i) => i.name)).toEqual(['argocd', 'GitHub', 'Grafana']);
    expect(items[0].name).toBe('Grafana');
  });
});

describe('normalizeUrl', () => {
  it('adds https:// to bare domains', () => {
    expect(normalizeUrl(' github.com/actions ')).toBe('https://github.com/actions');
  });

  it('keeps existing schemes', () => {
    expect(normalizeUrl('http://intranet.local')).toBe('http://intranet.local');
  });
});

describe('isValidHttpUrl', () => {
  it('accepts http and https', () => {
    expect(isValidHttpUrl('https://example.com/path?q=1')).toBe(true);
    expect(isValidHttpUrl('http://localhost:3000')).toBe(true);
  });

  it('rejects other schemes and garbage', () => {
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
  });
});

describe('monogram', () => {
  it('uses the first letter, upper-cased', () => {
    expect(monogram('  oci console')).toBe('O');
    expect(monogram('')).toBe('?');
  });
});
