import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const {
    timeoutMinutes = 5,
    warningMinutes = 1,
    onTimeout,
    onWarning,
  } = options;

  const { logout } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Update last activity
    lastActivityRef.current = Date.now();

    // Set warning timeout
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      if (onWarning) {
        onWarning();
      }
    }, warningTime);

    // Set logout timeout
    const logoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      logout();
      navigate('/login');
      if (onTimeout) {
        onTimeout();
      }
    }, logoutTime);
  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning, logout, navigate]);

  const handleActivity = useCallback((event: Event) => {
    // Don't reset timeout if the event is from the session timeout dialog
    const target = event.target as HTMLElement;
    if (target && typeof target.closest === 'function' && target.closest('[data-session-timeout-dialog]')) {
      return;
    }
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    // Set up event listeners for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [handleActivity, resetTimeout]);

  return {
    resetTimeout,
    getTimeRemaining: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
      return Math.max(0, remaining);
    },
  };
};
