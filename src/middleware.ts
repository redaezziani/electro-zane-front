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
      console.log('[Middleware] Validating token with:', BACKEND_API_URL);
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
      } else {
        // Token is invalid - clear cookies and redirect to login
        console.error('[Middleware] Token validation failed, clearing cookies');
        const loginUrl = new URL('/auth/login', request.url);
        const redirectResponse = NextResponse.redirect(loginUrl);

        // Clear the invalid cookies with proper domain settings
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
          path: '/',
          ...(isProduction && { domain: '.electrozane.com' }),
        };

        redirectResponse.cookies.set('access_token', '', { ...cookieOptions, maxAge: 0 });
        redirectResponse.cookies.set('refresh_token', '', { ...cookieOptions, maxAge: 0 });

        return redirectResponse;
      }
    } catch (error) {
      console.error('[Middleware] Backend token validation failed:', error);
      // Network error - clear cookies and redirect
      const loginUrl = new URL('/auth/login', request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        path: '/',
        ...(isProduction && { domain: '.electrozane.com' }),
      };

      redirectResponse.cookies.set('access_token', '', { ...cookieOptions, maxAge: 0 });
      redirectResponse.cookies.set('refresh_token', '', { ...cookieOptions, maxAge: 0 });

      return redirectResponse;
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
    console.log('[Middleware] Redirecting to login - no auth token');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0 && user) {
    if (!requiredRoles.includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  console.log('[Middleware] Allowing access to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|svgs).*)',
  ],
};
