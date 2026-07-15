import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/dealer', '/admin'];
const guestOnlyRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
const AUTH_COOKIE = 'auth-session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE);

  if (hasSession && guestOnlyRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!hasSession && isProtected) {
    const login = new URL('/login', request.url);
    login.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$|.*\\.webmanifest$|sw\\.js$).*)',
  ],
};
