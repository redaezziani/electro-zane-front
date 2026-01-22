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

  let user: { role: UserRole } | null = null;
  let isAuthenticated = false;

  if (accessToken) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/validate`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
      });

      console.log('[Middleware] Validation response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        isAuthenticated = true;
        user = data.user;
        console.log('[Middleware] User authenticated:', user?.role);
      }
    } catch (error) {
      console.error('[Middleware] Backend token validation failed:', error);
      isAuthenticated = false;
    }
  }

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
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0 && user) {
    if (!requiredRoles.includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|svgs).*)',
  ],
};
