export type Primitive = string | number | boolean | null | undefined;

// Generic row map used for simple table/pdf exports.
export type ExportRow = Record<string, Primitive>;

export interface PdfExportProps {
  filename?: string;
  title?: string;
  rows: ExportRow[];
  columns?: string[];
}
