import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-tactical-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-radio-cyan animate-spin" />
                    <span className="text-xs font-mono text-radio-cyan font-bold animate-pulse">ESTABLISHING UPLINK...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireSuperAdmin && !profile?.is_super_admin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
