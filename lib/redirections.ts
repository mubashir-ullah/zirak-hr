/**
 * Utility functions for handling redirections based on user role and verification status
 */

import { User } from '@supabase/auth-helpers-nextjs';

export type UserRole = 'talent' | 'hiring_manager' | 'admin' | '';

export interface UserRedirectionData {
  id?: string;
  email?: string;
  role?: UserRole;
  email_verified?: boolean;
  needs_role_selection?: boolean;
}

/**
 * Determines the appropriate redirection path based on user data
 * @param userData User data containing role and verification status
 * @returns The path to redirect the user to
 */
export function getRedirectionPath(userData: UserRedirectionData | null): string {
  // If no user data, redirect to login
  if (!userData) {
    return '/login';
  }

  // If email is not verified, redirect to verification page
  if (userData.email && !userData.email_verified) {
    return `/verify-email?email=${encodeURIComponent(userData.email)}`;
  }

  // If user needs role selection or has no role, redirect to role selection
  if (!userData.role || userData.needs_role_selection) {
    return userData.email 
      ? `/dashboard/role-selection?email=${encodeURIComponent(userData.email)}`
      : '/dashboard/role-selection';
  }

  // Redirect based on role
  switch (userData.role) {
    case 'talent':
      return '/dashboard/talent';
    case 'hiring_manager':
      return '/dashboard/hiring-manager';
    case 'admin':
      return '/dashboard/admin';
    default:
      // Fallback to role selection if role is invalid
      return '/dashboard/role-selection';
  }
}

/**
 * Checks if a user has access to a specific route based on their role
 * @param path The route path to check
 * @param role The user's role
 * @returns Boolean indicating if the user has access
 */
export function hasRouteAccess(path: string, role?: UserRole): boolean {
  // Define route patterns by role
  const talentRoutes = ['/dashboard/talent'];
  const hiringManagerRoutes = ['/dashboard/hiring-manager'];
  const adminRoutes = ['/dashboard/admin'];
  const publicRoutes = ['/', '/login', '/register', '/verify-email', '/dashboard/role-selection'];
  
  // Public routes are accessible to everyone
  if (publicRoutes.some(route => path.startsWith(route))) {
    return true;
  }
  
  // Check role-specific access
  switch (role) {
    case 'talent':
      return talentRoutes.some(route => path.startsWith(route));
    case 'hiring_manager':
      return hiringManagerRoutes.some(route => path.startsWith(route));
    case 'admin':
      // Admin can access all dashboard routes
      return path.startsWith('/dashboard');
    default:
      // No role or unknown role can only access public routes
      return publicRoutes.some(route => path.startsWith(route));
  }
}
