import { NextResponse, type NextRequest } from 'next/server';
import {
  publicRoutes,
  authenticatedRoutes,
  roleProtectedRoutes,
} from '@/lib/routes';
import { UserRole } from '@/types/auth.types';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // Debug logging for production troubleshooting
  console.log('[Middleware] Path:', pathname);
  console.log('[Middleware] Has access_token cookie:', !!accessToken);

  // For production: trust the presence of the cookie
  // The actual validation will happen on the client side and in API calls
  const isAuthenticated = !!accessToken;

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (publicRoutes.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  const requiredRoles: UserRole[] | undefined =
    roleProtectedRoutes[pathname as keyof typeof roleProtectedRoutes];

  // Check if route requires authentication
  const requiresAuth = authenticatedRoutes.includes(pathname) || requiredRoles !== undefined;

  if (requiresAuth && !isAuthenticated) {
    console.log('[Middleware] Redirecting to login - no auth token');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Note: Role-based access control will be handled by the page components
  // since we can't reliably decode JWT in edge middleware for cross-domain setups

  console.log('[Middleware] Allowing access to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|svgs).*)',
  ],
};
