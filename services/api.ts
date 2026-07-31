const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://carimportbackend-production.up.railway.app/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions): Promise<T> {
  // 1. Evitar errores de "localStorage is not defined" en el servidor de Next.js
  const isBrowser = typeof window !== "undefined";
  const token = isBrowser ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log(`[API Request] ${options.method} ${endpoint} | Token: ${token ? "Sí" : "No"}`);

  // 2. Normalizar la URL para evitar dobles slashes (ej: api//productos)
  const baseUrl = API_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // 3. Manejo de expiración o falta de permisos
    if (response.status === 401 || response.status === 403) {
      console.error("Auth error:", response.status);
      if (isBrowser) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new Error("Sesión expirada o permisos insuficientes");
    }

    // 4. Manejo de errores de servidor o cliente (400, 500)
    if (!response.ok) {
      let errorMessage = "Error en la petición";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = (await response.text()) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // 5. Respuestas sin contenido
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
    
  } catch (error) {
    console.error(`[API Error] Falló la petición a ${path}:`, error);
    throw error;
  }
}