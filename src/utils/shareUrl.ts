import { appPath } from './appPath';

export function buildShareUrl(currentUrl: URL): string {
  const isGitHubPages = currentUrl.hostname.endsWith('github.io');
  if (!isGitHubPages) {
    return currentUrl.toString();
  }

  const basePath = appPath('/').replace(/\/$/, '');
  const basePrefix = `${basePath}/`;
  const relativePath = currentUrl.pathname.startsWith(basePrefix)
    ? currentUrl.pathname.slice(basePrefix.length)
    : currentUrl.pathname.replace(/^\//, '');

  const query = currentUrl.search ? `&${currentUrl.search.slice(1)}` : '';
  const hash = currentUrl.hash ?? '';
  return `${currentUrl.origin}${basePath}/?/${relativePath}${query}${hash}`;
}
