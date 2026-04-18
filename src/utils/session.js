export function getStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem('metroUser') || 'null');
  } catch (error) {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem('metroUser', JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem('metroUser');
}

export function isAdminUser(user) {
  return user?.role === 'admin';
}
