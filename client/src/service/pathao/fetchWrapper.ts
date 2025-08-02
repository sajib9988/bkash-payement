type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
};

export const fetchWrapper = async (url: string, options: RequestOptions = {}) => {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json; charset=UTF-8',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let result;

  try {
    result = await res.json();
  } catch (err) {
    console.error("❌ Failed to parse response:", err);
    throw new Error(`Invalid JSON response from ${url}`);
  }

  if (!res.ok) {
    console.error(`❌ API Error: ${url}`, result);
    const message = result?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return result;
};
