const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function appPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!APP_BASE) {
    return normalizedPath;
  }
  if (normalizedPath === '/') {
    return `${APP_BASE}/`;
  }
  return `${APP_BASE}${normalizedPath}`;
}
