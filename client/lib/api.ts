export const tokenKey = "reciclatech_token";

//Pegar o Token JWT:
export function getToken() {
  return localStorage.getItem(tokenKey) || "";
}

//Armazenar o Token JWT:
export function setToken(token: string) {
  if (token) localStorage.setItem(tokenKey, token);
}

//Fazer uma requisição utilizando o Token JWT:
export async function apiFetch<T = any>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
