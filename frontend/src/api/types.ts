export interface UrlItem {
  id: number;
  name: string;
  url: string;
  description: string;
}

export type UrlInput = Omit<UrlItem, 'id'>;

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
