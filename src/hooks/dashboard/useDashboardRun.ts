import { useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";

export function useDashboardRun() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (symbol: string) => {
    if (!symbol.trim()) {
      setError(t("dashboard.symbolRequired"));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // TODO: dashboard run logic
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, error };
}
