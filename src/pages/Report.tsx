import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import AnalysisMetaBar from "../components/analysis/AnalysisMetaBar";
import { mapAnalyzeResponseToViewModel } from "../components/analysis/mappers";
import { AnalyzeResponse } from "../types/api";

interface ReportProps {
  response: AnalyzeResponse;
}

export default function Report({ response }: ReportProps) {
  const { colors } = useTheme();
  const viewModel = mapAnalyzeResponseToViewModel(response);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg.DEFAULT }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {viewModel.id}
      </Text>

      <AnalysisMetaBar
        asOf={viewModel.asOf}
        generatedAt={viewModel.createdAt}
        dataFreshness={viewModel.dataFreshness}
      />

      <View style={styles.resultContainer}>
        <Text style={[styles.resultText, { color: colors.text.secondary }]}>
          {JSON.stringify(viewModel.result, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultText: {
    fontSize: 13,
    fontFamily: "monospace",
  },
});
