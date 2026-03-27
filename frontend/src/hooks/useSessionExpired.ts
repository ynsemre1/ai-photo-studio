import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SESSION_EXPIRED_EVENT } from "../api/client";

/**
 * Listens for the "session-expired" custom event dispatched by apiFetch
 * when a token refresh fails, then performs a SPA-internal redirect to /login.
 *
 * Mount this once near the top of the React tree (e.g. inside <App />).
 *
 * @param onExpired  Optional callback invoked right before the redirect.
 *                   Use it to show a toast / notification to the user.
 */
export function useSessionExpired(onExpired?: () => void): void {
  const navigate = useNavigate();

  useEffect(() => {
    function handler() {
      onExpired?.();
      navigate("/login", { replace: true });
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, [navigate, onExpired]);
}
