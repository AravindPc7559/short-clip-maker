import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RouteGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
  allowedRoles?: string[];
  onUnauthorized?: () => void;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children,
  requireVerification = false,
  allowedRoles = [],
  onUnauthorized
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      return; // ProtectedRoute will handle authentication redirect
    }

    // Check if user verification is required
    if (requireVerification && user && !user.settings) {
      toast({
        title: "Account verification required",
        description: "Please verify your account to access this feature",
        variant: "destructive",
      });
      
      if (onUnauthorized) {
        onUnauthorized();
      }
      return;
    }

    // Check user roles if specified
    if (allowedRoles.length > 0 && user) {
      // Note: This assumes you have roles in your user object
      // Adjust based on your user model structure
      const hasRequiredRole = allowedRoles.some(role => 
        user.settings?.storagePreference === role || // Example role check
        role === 'user' // Default role
      );

      if (!hasRequiredRole) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          // Redirect to dashboard or logout
          window.location.href = '/dashboard/upload';
        }
        return;
      }
    }

    // Additional security checks can be added here
    // For example: check if user's session is still valid
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      const maxInactivityTime = 24 * 60 * 60 * 1000; // 24 hours

      if (timeSinceLastActivity > maxInactivityTime) {
        toast({
          title: "Session expired",
          description: "Please log in again for security",
          variant: "destructive",
        });
        logout();
        return;
      }
    }

    // Update last activity
    localStorage.setItem('lastActivity', Date.now().toString());
  }, [isAuthenticated, user, requireVerification, allowedRoles, onUnauthorized, toast, logout]);

  return <>{children}</>;
};
