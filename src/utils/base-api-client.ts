import { ofetch } from 'ofetch';

export abstract class BaseAPIClient {
  fetch: typeof ofetch;
  constructor(baseURL: string, headers: { [key: string]: string }) {
    this.fetch = ofetch.create({ baseURL, headers });
  }

  public get<T>(url: string) {
    return this.fetch<T>(url);
  }

  public post<T>(url: string, body: { [key: string]: any }) {
    return this.fetch<T>(url, {
      method: 'POST',
      body,
    });
  }
}
