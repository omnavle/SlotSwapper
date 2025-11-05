const API_BASE_URL = import.meta.env.VITE_API_URL;

fetch(`${API_BASE_URL}/api/slots`)
  .then(res => res.json())
  .then(data => console.log('Test API response:', data))
  .catch(err => console.error('API fetch error:', err));

export async function authFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = opts.headers || {};

  if (!token) {
    console.warn('⚠️ No token found — redirecting to login.');
    throw new Error('No token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers,
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'API error');
  return data;
}

export default API_BASE_URL;
