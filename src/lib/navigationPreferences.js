// Only module keys are stored: never record names, search terms or record URLs.
export function navigationScope(user) {
  const tenant = user?.tenant_id || user?.data?.tenant_id;
  return user?.id && tenant ? 'chr-navigation-v1:' + encodeURIComponent(tenant) + ':' + encodeURIComponent(user.id) : null;
}
export function cleanModuleKeys(keys, allowedKeys, limit = 12) {
  if (!Array.isArray(keys)) return [];
  const allowed = new Set(allowedKeys);
  return [...new Set(keys.filter((key) => typeof key === 'string' && allowed.has(key)))].slice(0, limit);
}
export function readNavigation(storage, scope, allowedKeys) {
  if (!scope) return { favourites: [], recent: [] };
  try {
    const value = JSON.parse(storage.getItem(scope) || '{}');
    return { favourites: cleanModuleKeys(value?.favourites, allowedKeys), recent: cleanModuleKeys(value?.recent, allowedKeys, 5) };
  } catch { return { favourites: [], recent: [] }; }
}
export function matchesModulePath(pathname, path) {
  const aliases = { '/roster': '/rostering', '/shifts': '/rostering', '/participants': '/our-participants', '/staff': '/our-employees', '/contacts': '/key-contacts' };
  const base = '/' + pathname.split('/')[1];
  const canonical = aliases[base] ? aliases[base] + pathname.slice(base.length) : pathname;
  return canonical === path || (path !== '/' && canonical.startsWith(path + '/')); 
}
