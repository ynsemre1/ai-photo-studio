"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getMe } from "../api/auth";
import { ApiError } from "../api/errors";
import { clearSession } from "../utils/session";

interface DashboardProps {
  onLogout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    async function fetchMe() {
      try {
        const me = await getMe();
        setUser(me);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          localStorage.removeItem("auth");
          onLogout();
          return;
        }
        if (err instanceof ApiError) {
          setDashboardError(err.message);
        } else {
          setDashboardError(tRef.current("dashboard.unableToLoadAccount"));
        }
      }
    }

    fetchMe();
  }, [onLogout]);

  if (dashboardError) {
    return <div className="dashboard-error">{dashboardError}</div>;
  }

  if (!user) {
    return <div className="dashboard-loading">{t("dashboard.loading")}</div>;
  }

  return (
    <div className="dashboard">
      <h1>{t("dashboard.welcome", { name: user.name })}</h1>
      <p>{user.email}</p>
    </div>
  );
}
