import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../i18n/I18nProvider";

type Props = {
  data: Record<string, unknown> | null;
};

export default function CompactAnalyzeSummary({ data }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();

  if (!data) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface[100], borderColor: colors.primary[700] },
      ]}
    >
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {t("dashboard.latestSnapshot")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
});
