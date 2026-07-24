import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07110f] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-2 border-[#c6a75b]/20 border-t-[#c6a75b] rounded-none animate-spin" />
          <ShieldCheck className="w-6 h-6 text-[#c6a75b] absolute" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono uppercase tracking-[.2em] text-[#d8bb70]">Authenticating Officer Portal</p>
          <p className="text-xs text-slate-400 font-mono">Verifying security token and permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
