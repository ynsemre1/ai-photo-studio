import React, { useState, useEffect, useCallback } from "react";
import { getAuthToken, clearSession } from "../api/client";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(getAuthToken())
  );

  // Auth token is stored in sessionStorage, which is tab-scoped and does NOT
  // fire "storage" events across tabs. Cross-tab auth sync would require a
  // different mechanism (e.g. BroadcastChannel API). A window "storage" event
  // listener here would be dead code.

  const handleLogout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>AI Photo Studio</h1>
        <p>Transform your photos with AI</p>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <section className="dashboard-content">
        <div className="section">
          <h2>Recent Creations</h2>
        </div>

        <div className="section">
          <h2>Favorites</h2>
        </div>

        <div className="section">
          <h2>All Styles</h2>
        </div>
      </section>
    </div>
  );
}
