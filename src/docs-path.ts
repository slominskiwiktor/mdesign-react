// Public documentation can be served at the origin root or a project subpath.
export const docsBase = import.meta.env.VITE_DOCS_BASE || '/';
export const docsPath = (path: string) => `${docsBase}${path.replace(/^\//, '')}`;
export const docsPathname = (pathname: string) =>
  pathname.startsWith(docsBase) ? `/${pathname.slice(docsBase.length)}` : pathname;
