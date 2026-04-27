const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export const api = {
  // Properties
  getProperties: (agency: string) => req<unknown[]>("GET", `/api/${agency}/properties`),
  addProperty: (agency: string, data: unknown) => req<unknown>("POST", `/api/${agency}/properties`, data),
  updateProperty: (agency: string, id: string, data: unknown) => req<unknown>("PUT", `/api/${agency}/properties/${id}`, data),
  deleteProperty: (agency: string, id: string) => req<void>("DELETE", `/api/${agency}/properties/${id}`),

  // Config sections (founder, agents, services, contacts, siteInfo, reviews)
  getConfig: <T>(agency: string, section: string) => req<T>("GET", `/api/${agency}/config/${section}`),
  setConfig: <T>(agency: string, section: string, data: T) => req<T>("PUT", `/api/${agency}/config/${section}`, data as unknown),

  // Upload
  uploadFile: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url as string;
  },
};
