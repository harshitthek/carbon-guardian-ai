export const authService = {
  login: async (email, name) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const role = email === 'admin@carbon.ai' ? 'admin' : 'user';
    const user = {
      id: Math.random().toString(36).substring(7),
      email,
      name: name || email.split('@')[0],
      role,
      token: 'fake-jwt-token-' + Date.now(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name || email}`,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('carbon_user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('carbon_user');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('carbon_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('carbon_user');
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  }
};
