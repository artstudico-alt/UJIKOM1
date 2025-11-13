import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import { useAuth } from '../../contexts/AuthContext';
import SessionTimeoutDialog from './SessionTimeoutDialog';

interface SessionTimeoutContextType {
  showWarning: boolean;
  timeRemaining: number;
  extendSession: () => void;
  logout: () => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export const useSessionTimeoutContext = () => {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error('useSessionTimeoutContext must be used within a SessionTimeoutProvider');
  }
  return context;
};

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { logout: authLogout } = useAuth();

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleTimeout = useCallback(() => {
    setShowWarning(false);
    authLogout();
  }, [authLogout]);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    // The useSessionTimeout hook will automatically reset the timeout
  }, []);

  const logout = useCallback(() => {
    setShowWarning(false);
    authLogout();
  }, [authLogout]);

  const { getTimeRemaining } = useSessionTimeout({
    timeoutMinutes: 5,
    warningMinutes: 1,
    onWarning: handleWarning,
    onTimeout: handleTimeout,
  });

  // Update time remaining every second when warning is shown
  React.useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning, getTimeRemaining]);

  const contextValue: SessionTimeoutContextType = {
    showWarning,
    timeRemaining,
    extendSession,
    logout,
  };

  return (
    <SessionTimeoutContext.Provider value={contextValue}>
      {children}
      <SessionTimeoutDialog
        open={showWarning}
        timeRemaining={timeRemaining}
        onExtend={extendSession}
        onLogout={logout}
      />
    </SessionTimeoutContext.Provider>
  );
};
