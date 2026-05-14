export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  try {
    const { token, headers, ...requestOptions } = options;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      }
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T & { message?: string }) : undefined;

    if (!response.ok) {
      throw new Error(data?.message ?? `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Network request failed");
  }
}
