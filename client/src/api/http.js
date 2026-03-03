const API_BASE = "http://localhost:3001";

export async function apiFetch(path, { token, ...options } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}