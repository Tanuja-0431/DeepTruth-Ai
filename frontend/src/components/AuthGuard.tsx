import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect unauthenticated users to the Login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if profile is incomplete and redirect to dashboard's profile tab
  if (location.pathname !== '/dashboard' && !user.isProfileComplete) {
    return <Navigate to="/dashboard" state={{ tab: 'profile' }} replace />;
  }

  return children;
}
