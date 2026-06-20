import { headers } from "next/headers";

const ADMIN_HOST = process.env.ADMIN_HOST || "admin.thecontrarian.club";

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
  const host = (await headers()).get("host") ?? "";
  return host.split(":")[0] ?? "";
}

export async function currentAdminPath(path: string) {
  return adminPath(path, await currentHostname());
}
