const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://carimportbackend-production.up.railway.app/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log("Request:", options.method, endpoint, "Token:", token ? "Sí" : "No");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 || response.status === 403) {
    console.error("Auth error:", response.status);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Error en la petición");
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}