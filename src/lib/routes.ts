import { UserRole } from '@/types/auth.types';

export const publicRoutes = ['/auth/login', '/unauthorized'];

export const authenticatedRoutes = ['/dashboard'];

export const roleProtectedRoutes = {
  '/dashboard/users': [UserRole.ADMIN],
  '/dashboard/roles': [UserRole.ADMIN],
  '/dashboard/categories': [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/products': [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/product-variants': [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/skus': [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/orders': [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/order-items': [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/lots': [UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/lot-arrivals': [UserRole.MODERATOR, UserRole.ADMIN],
  '/dashboard/analytics': [],
  '/dashboard/logs': [UserRole.ADMIN], // Only admins can view logs
  '/dashboard/settings': [],
};

export const authRoutes = publicRoutes;
