"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PdfExportProps, ExportRow } from "@/types/Export";

const styles = StyleSheet.create({
  page: { padding: 16, fontSize: 10 },
  header: { fontSize: 14, marginBottom: 8 },
  table: { display: "flex", flexDirection: "column", width: "100%" },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    paddingBottom: 6,
    marginBottom: 4,
    backgroundColor: "#f0f0f0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  col: { marginRight: 8 },
  cellText: { fontSize: 10 },
});

export default function PdfExport(props: PdfExportProps) {
  const { filename = "export.pdf", title = "Export", rows, columns } = props;
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const doc = (
        <Document>
          <Page style={styles.page} size="A4">
            <Text style={styles.header}>{title}</Text>

            <View style={styles.table}>
              {columns && columns.length > 0 ? (
                <>
                  {/* header row */}
                  <View style={styles.headerRow}>
                    {columns.map((c) => (
                      <View
                        key={c}
                        style={{
                          width: `${100 / columns.length}%`,
                          paddingRight: 6,
                        }}
                      >
                        <Text style={[styles.cellText, { fontWeight: 700 }]}>
                          {String(c)
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (ch) => ch.toUpperCase())}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* data rows */}
                  {rows.map((r: ExportRow, idx: number) => (
                    <View key={idx} style={styles.tableRow}>
                      {columns.map((c) => {
                        const raw = r[c];
                        const text =
                          typeof raw === "number"
                            ? (raw as number).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : String(raw ?? "");
                        return (
                          <View
                            key={c}
                            style={{
                              width: `${100 / columns.length}%`,
                              paddingRight: 6,
                            }}
                          >
                            <Text style={styles.cellText}>{text}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </>
              ) : (
                <View>
                  <Text>{JSON.stringify(rows, null, 2)}</Text>
                </View>
              )}
            </View>
          </Page>
        </Document>
      );

      const asBlob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(asBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={"secondary"} size={"sm"} onClick={handleExport}>
      {loading ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
