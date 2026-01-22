import { ESLINT_SEVERITY } from "./constants";
import type { ESLintLintResults } from "./types";

export interface DiagnosticData {
  file: string;
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: "error" | "warning";
    ruleId?: string;
  }>;
}

const severityMap: Record<number, "error" | "warning"> = {
  [ESLINT_SEVERITY.ERROR]: "error",
  [ESLINT_SEVERITY.WARNING]: "warning",
};

export const formatDiagnostic = (
  results: ESLintLintResults,
): DiagnosticData[] => {
  return results
    .filter((result) => result.errorCount > 0 || result.warningCount > 0)
    .map((result) => ({
      file: result.filePath,
      errors: result.messages.map((message) => ({
        line: message.line,
        column: message.column,
        message: message.message,
        severity: severityMap[message.severity],
        ruleId: message.ruleId ?? undefined,
      })),
    }));
};
