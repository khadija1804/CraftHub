import {jwtDecode} from 'jwt-decode';

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // En secondes
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return false;
    }
    return { role: decoded.role, id: decoded.id };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return false;
  }
};

export const getUserRole = () => {
  const auth = isAuthenticated();
  return auth ? auth.role : null;
};