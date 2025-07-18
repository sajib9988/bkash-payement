// client/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from '@/service/AuthService';


const authRoutes = ['/login', '/register'];
const protectedRoutes = ['/cart', '/admin', '/user', ];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userInfo = await getCurrentUser();
  const isAuthed = !!userInfo;

  // If user is logged in
  if (isAuthed) {
    // Redirect from auth routes to home
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role-based protection for admin routes
    // Note: The role in your IUser type is "ADMIN" (uppercase)
    if (userInfo.role !== 'ADMIN' && pathname.startsWith('/admin')) {
       return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow access if authenticated and authorized
    return NextResponse.next();
  }

  // If user is NOT logged in and trying to access a protected route
  if (!isAuthed && protectedRoutes.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectPath', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow access to public routes
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
