import { ofetch } from 'ofetch';

// BaseAPIClient is a generic HTTP client utility, not specific to providers
// Other parts of the application might want to use this HTTP client in the future, hence this is in the lib

export abstract class BaseAPIClient {
  constructor(
    protected baseURL: string,
    protected headers: { [key: string]: string }
  ) {}

  public get<T>(url: string) {
    return ofetch<T>(url, {
      baseURL: this.baseURL,
      headers: this.headers,
    });
  }

  public post<T>(url: string, body: unknown) {
    return ofetch<T>(url, {
      method: 'POST',
      baseURL: this.baseURL,
      headers: this.headers,
      body: JSON.stringify(body),
    });
  }
}
