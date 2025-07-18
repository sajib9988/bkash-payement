import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const authRoutes = ["/login", "/register"];
  const protectedRoutes = ["/cart", "/admin", "/user"];

  if (token) {
    const user: any = jwtDecode(token);

    // If logged-in user tries to access /login or /register, redirect to home
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If user is not admin but tries to access /admin
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // If not logged in and trying to access protected route
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectPath", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/cart",
    "/admin/:path*",
    "/user/:path*",
  ],
};
