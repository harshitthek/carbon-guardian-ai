const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Login failed');
    return authService.getCurrentUser();
  },

  signup: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include'
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Signup failed');
    }
    return authService.getCurrentUser();
  },

  logout: async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
  },

  getCurrentUser: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (!res.ok) return null;
      const user = await res.json();
      return user;
    } catch {
      return null;
    }
  }
};
