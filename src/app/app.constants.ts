// export type BackendKey = 'local' | 'dev' | 'staging' | 'prod';

// export const BACKEND_BASE_URLS: Record<BackendKey, string> = {
//   local: 'http://localhost:8080',
//   dev: 'http://192.168.0.100:8080',
//   staging: 'https://staging.api.example.com',
//   prod: 'https://api.example.com'
// };

// export const DEFAULT_BACKEND: BackendKey = 'local';

// export const API_BASE_URL: string = (window as any)['API_BASE_URL']
//   || BACKEND_BASE_URLS[(window as any)['API_BACKEND_KEY'] as BackendKey]
//   || BACKEND_BASE_URLS[DEFAULT_BACKEND];

// export function setBackendByKey(backendKey: BackendKey): void {
//   (window as any)['API_BACKEND_KEY'] = backendKey;
//   (window as any)['API_BASE_URL'] = BACKEND_BASE_URLS[backendKey];
// }

// export function setBackendByUrl(baseUrl: string): void {
//   (window as any)['API_BACKEND_KEY'] = undefined;
//   (window as any)['API_BASE_URL'] = baseUrl;
// }

export const API_BASE_URL = 'http://localhost:8080';

export const API_URL = 'http://192.168.123.82:8082/rma-api';

// For Routing
// export const ROUTE_URL = 'https://bhutanbelieve.bt/';

export const ROUTE_URL = 'http://localhost:4200'; //Local Server
export const userExists = 'Y';
export const userDeleted = 'N';
