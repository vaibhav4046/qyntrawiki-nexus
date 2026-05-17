import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/onboarding";
  const isPublicPage = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/p/");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/app", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
