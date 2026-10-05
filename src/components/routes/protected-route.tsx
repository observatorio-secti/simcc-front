import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { useModal } from '../hooks/use-modal-store';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { onOpen } = useModal();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onOpen('auth-modal');
    }
  }, [isLoading, isAuthenticated, onOpen]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006699] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
