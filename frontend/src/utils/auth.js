const TOKEN_KEY = 'portal_auth_token';
const USER_KEY = 'portal_auth_user';

export const authUtil = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  hasRole(roleName) {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    return user.roles.includes('Admin') || user.roles.includes(roleName);
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.roles && user.roles.includes('Admin');
  }
};
