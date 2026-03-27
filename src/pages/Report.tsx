import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "../i18n/I18nProvider";

export default function Report() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    const restore = async () => {
      try {
        // TODO: restore report logic
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };

    restore();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg.DEFAULT }]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          {t("report.restoring")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg.DEFAULT }]}>
        <Text style={[styles.errorText, { color: colors.text.primary }]}>
          {t("report.restoreError")}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary.DEFAULT }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
            {t("report.backToDashboard")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.backLink, { color: colors.primary.DEFAULT }]}>
          {t("report.backToDashboard")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
});
