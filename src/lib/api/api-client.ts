import { getApiBaseUrl, getAuthToken } from "@/store/services/baseUrl";

async function request(url: string, method = "GET", body?: any, params?: any) {
  const baseUrl = getApiBaseUrl();
  let fullUrl = `${baseUrl}${url}`;
  
  if (params) {
    const qParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        qParams.append(k, String(v));
      }
    });
    const qStr = qParams.toString();
    if (qStr) {
      fullUrl += `?${qStr}`;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      options.body = body;
      // Do not set Content-Type for FormData, browser sets it automatically with boundary
    } else {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(fullUrl, options);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  // Laravel responses are typically wrapped in { data: ... }
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
  }
  return data;
}

const postUpdateServices = ["users", "hotels", "rooms"];

const kebabCase = (str: string) => 
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const apiClient = new Proxy({} as any, {
  get(target, propKey) {
    if (typeof propKey !== "string") return undefined;
    
    const serviceName = kebabCase(propKey);
    const serviceUrl = `/${serviceName}`;

    return {
      getAll: (params?: any) => request(serviceUrl, "GET", undefined, params),
      getById: (id: string | number, params?: any) => request(`${serviceUrl}/${id}`, "GET", undefined, params),
      create: (body: any) => request(serviceUrl, "POST", body),
      update: (id: string | number, body: any) => {
        const method = postUpdateServices.includes(propKey) ? "POST" : "PUT";
        return request(`${serviceUrl}/${id}`, method, body);
      },
      delete: (id: string | number) => request(`${serviceUrl}/${id}`, "DELETE"),
      updateStatus: (id: string | number, body: any) => {
        return request(`${serviceUrl}/${id}/status`, "PUT", body);
      }
    };
  }
});
