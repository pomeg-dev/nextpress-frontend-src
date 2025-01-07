export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export function deleteWPCookies() {
  document.cookie.split(';').forEach(function(cookie) {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('jwt_')) {
      document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  });
}