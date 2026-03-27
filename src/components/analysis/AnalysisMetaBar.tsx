import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { t } from "../../i18n";
import { DataFreshness } from "../../types/api";

interface AnalysisMetaBarProps {
  asOf: string;
  generatedAt: string;
  dataFreshness: DataFreshness;
}

export default function AnalysisMetaBar({
  asOf,
  generatedAt,
  dataFreshness,
}: AnalysisMetaBarProps) {
  const { colors, scheme } = useTheme();
  const isStale = dataFreshness.data_freshness_status === "stale";
  const isUnknown = dataFreshness.data_freshness_status === "unknown";

  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: colors.text.secondary }]}>
          {t("analysisMeta.asOf")}
        </Text>
        <Text style={[styles.metaValue, { color: colors.text.primary }]}>
          {asOf}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: colors.text.secondary }]}>
          {t("analysisMeta.generatedAt")}
        </Text>
        <Text style={[styles.metaValue, { color: colors.text.primary }]}>
          {generatedAt}
        </Text>
      </View>

      {isStale && (
        <View
          style={[
            styles.staleBanner,
            {
              backgroundColor:
                scheme === "dark" ? "rgba(245,158,11,0.15)" : "#FEF3C7",
              borderColor: colors.warning.DEFAULT,
            },
          ]}
        >
          <Feather
            name="alert-triangle"
            size={16}
            color={colors.warning.DEFAULT}
          />
          <View style={styles.staleTextContainer}>
            <Text
              style={[styles.staleTitle, { color: colors.warning.DEFAULT }]}
            >
              {t("dataFreshness.staleWarning")}
            </Text>
            <Text
              style={[styles.staleDetail, { color: colors.text.secondary }]}
            >
              {t("dataFreshness.lastUpdated", {
                minutes: dataFreshness.staleness_minutes,
              })}
            </Text>
          </View>
        </View>
      )}

      {isUnknown && (
        <View
          style={[
            styles.staleBanner,
            {
              backgroundColor:
                scheme === "dark" ? "rgba(59,130,246,0.15)" : "#DBEAFE",
              borderColor: colors.info.DEFAULT,
            },
          ]}
        >
          <Feather
            name="help-circle"
            size={16}
            color={colors.info.DEFAULT}
          />
          <Text style={[styles.staleTitle, { color: colors.info.DEFAULT }]}>
            {t("dataFreshness.unknown")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  staleBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    gap: 10,
  },
  staleTextContainer: {
    flex: 1,
    gap: 2,
  },
  staleTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  staleDetail: {
    fontSize: 12,
  },
});
