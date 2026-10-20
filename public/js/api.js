// API client wrapper untuk SaumaBox

const api = {
  token: localStorage.getItem('saumabox_token') || '',

  setToken(token) {
    this.token = token || '';
    if (token) {
      localStorage.setItem('saumabox_token', token);
    } else {
      localStorage.removeItem('saumabox_token');
    }
  },

  async request(endpoint, options = {}) {
    const headers = options.headers || {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    options.headers = headers;
    options.credentials = 'same-origin';

    try {
      const res = await fetch(endpoint, options);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired atau unauthorized
          this.setToken('');
          if (window.onAuthExpired) {
            window.onAuthExpired();
          }
        }
        const errorMsg = data && data.error ? data.error : `HTTP ${res.status}: Terjadi kesalahan`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    }
    const queryString = query.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: data });
  },

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: data });
  },

  patch(endpoint, data) {
    return this.request(endpoint, { method: 'PATCH', body: data });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData
    });
  }
};
