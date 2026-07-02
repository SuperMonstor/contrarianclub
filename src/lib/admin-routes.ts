// Literal host defaults, shared so the admin/public hostnames are defined in
// exactly one place. Kept free of any node-only or server-only top-level
// imports so this module is safe to pull into the proxy and client bundles.
export const DEFAULT_ADMIN_HOST = "admin.thecontrarian.club";
export const DEFAULT_PUBLIC_HOST = "thecontrarian.club";

export const ADMIN_HOST = process.env.ADMIN_HOST || DEFAULT_ADMIN_HOST;
export const PUBLIC_HOST = process.env.PUBLIC_HOST || DEFAULT_PUBLIC_HOST;

export function isAdminHostname(hostname: string) {
  return hostname === ADMIN_HOST;
}

export function adminPath(path: string, hostname: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (isAdminHostname(hostname)) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? "/admin" : `/admin${normalizedPath}`;
}

export async function currentHostname() {
  // Imported lazily so the top level of this module stays server-only free and
  // can be shared with the proxy and client bundles.
  const { headers } = await import("next/headers");
  const host = (await headers()).get("host") ?? "";
  return host.split(":")[0] ?? "";
}

export async function currentAdminPath(path: string) {
  return adminPath(path, await currentHostname());
}
