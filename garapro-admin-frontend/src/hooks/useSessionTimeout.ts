// hooks/useSessionTimeout.ts
import { useEffect } from 'react';
import { securityPolicyService } from '@/services/securityPolicyService';

export const useSessionTimeout = (onTimeout: () => void) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onTimeout, securityPolicyService.getSessionTimeoutInMs());
    };
    
    // Set up event listeners for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });
    
    // Initialize the timeout
    resetTimeout();
    
    // Clean up
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [onTimeout]);
};