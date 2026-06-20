import { NextResponse, type NextRequest } from "next/server";

const ADMIN_HOST = process.env.ADMIN_HOST || "admin.thecontrarian.club";
const PUBLIC_HOST = process.env.PUBLIC_HOST || "thecontrarian.club";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";
  const isAdminHost = hostname === ADMIN_HOST;
  const isPublicHost = hostname === PUBLIC_HOST || hostname === `www.${PUBLIC_HOST}`;
  const isPublicEventPath =
    url.pathname === "/join" ||
    url.pathname.startsWith("/join/") ||
    url.pathname === "/present" ||
    url.pathname.startsWith("/present/");

  if (isAdminHost) {
    if (isPublicEventPath) {
      const publicUrl = new URL(`${url.pathname}${url.search}`, `https://${PUBLIC_HOST}`);
      return NextResponse.redirect(publicUrl);
    }

    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      const cleanPath = url.pathname.replace(/^\/admin/, "") || "/";
      const cleanUrl = new URL(cleanPath, url);
      cleanUrl.search = url.search;
      return NextResponse.redirect(cleanUrl);
    }

    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isPublicHost && (url.pathname === "/admin" || url.pathname.startsWith("/admin/"))) {
    const cleanPath = url.pathname.replace(/^\/admin/, "") || "/";
    const adminUrl = new URL(cleanPath, `https://${ADMIN_HOST}`);
    adminUrl.search = url.search;
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
