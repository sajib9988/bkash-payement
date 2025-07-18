import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const authRoutes = ["/login", "/register"];
  const protectedRoutes = ["/cart", "/user",  "/admin"];

  if (token) {
    const user: any = jwtDecode(token);

    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

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
    "/admin/:path*",
    "/user/:path*",
    "/cart",
    
  ],
};
