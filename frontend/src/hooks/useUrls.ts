import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../api/client';
import type { UrlInput, UrlItem } from '../api/types';
import { sortUrls } from '../utils/urls';

export function useUrls() {
  const [items, setItems] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(sortUrls(await api.listUrls()));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(async (token: string, input: UrlInput) => {
    const created = await api.createUrl(token, input);
    setItems((current) => sortUrls([...current, created]));
  }, []);

  const edit = useCallback(async (token: string, id: number, input: UrlInput) => {
    const updated = await api.updateUrl(token, id, input);
    setItems((current) => sortUrls(current.map((item) => (item.id === id ? updated : item))));
  }, []);

  const remove = useCallback(async (token: string, id: number) => {
    await api.deleteUrl(token, id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  return { items, loading, error, reload: load, add, edit, remove };
}
