import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const { nextUrl } = request;
  const isPublic =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/signup" ||
    nextUrl.pathname.startsWith("/p/") ||
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname.startsWith("/_next/") ||
    nextUrl.pathname.includes(".");

  if (isPublic) {
    return NextResponse.next();
  }

  // For demo: allow all app routes (client-side auth will handle UI)
  // In production, you'd verify the JWT cookie here
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
