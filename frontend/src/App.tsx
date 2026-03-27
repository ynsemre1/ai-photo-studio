import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useCallback, useState } from "react";
import { getAccessToken } from "./api/client";
import { useSessionExpired } from "./hooks/useSessionExpired";

// ---------------------------------------------------------------------------
// Session-expired notification banner
// ---------------------------------------------------------------------------

function SessionExpiredBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "12px 16px",
        backgroundColor: "#dc2626",
        color: "#fff",
        textAlign: "center",
        zIndex: 9999,
        fontSize: 14,
      }}
    >
      Oturumunuz sona erdi. Lutfen tekrar giris yapin.
    </div>
  );
}

// ---------------------------------------------------------------------------
// RequireAuth  –  SPA-internal guard using React Router <Navigate>
// ---------------------------------------------------------------------------

function RequireAuth() {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// ---------------------------------------------------------------------------
// SessionExpiredListener
// Mounted inside <BrowserRouter> so it has access to React Router context.
// ---------------------------------------------------------------------------

function SessionExpiredListener({
  onExpired,
}: {
  onExpired: () => void;
}) {
  useSessionExpired(onExpired);
  return null;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [showBanner, setShowBanner] = useState(false);

  const handleSessionExpired = useCallback(() => {
    setShowBanner(true);
  }, []);

  return (
    <BrowserRouter>
      <SessionExpiredBanner visible={showBanner} />
      <SessionExpiredListener onExpired={handleSessionExpired} />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          {/* Add more protected routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// ---------------------------------------------------------------------------
// Placeholder page components (replace with real implementations)
// ---------------------------------------------------------------------------

function LoginPage() {
  return <div>Login</div>;
}

function HomePage() {
  return <div>Home</div>;
}
