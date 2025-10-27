"use client";
import {
  AllCommunityModule,
  ICellRendererParams,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import PdfExport from "@/components/pdf-export";
import { Eye, Pencil, Trash2, Search, PlusIcon } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface GridTableProps<T extends object> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  onEdit?: (row: T) => void;
  onView?: (row: T) => void;
  onRecordReading?: (row: T) => void;
  onDelete?: (row: T) => void;
  onCreate?: () => void;
  height?: number;
  width?: number;
  buttonName?: string;
}

const GridTable = <T extends object>({
  rowData,
  columnDefs,
  onEdit,
  onView,
  onRecordReading,
  onDelete,
  onCreate,
  height = 480,
  buttonName,
}: // width = 800,
GridTableProps<T>) => {
  const [quickFilterText, setQuickFilterText] = useState("");

  const columnWithActions = useMemo<ColDef<T>[]>(() => {
    const actionsCol: ColDef<T> = {
      headerName: "Actions",
      width: 100,
      cellRenderer: (params: ICellRendererParams<T>) => {
        const row = params.data;
        if (!row) return null;

        return (
          <div className="flex flex-row justify-center gap-2 items-center h-full">
            {onRecordReading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRecordReading(row)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Record Reading"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            )}
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(row)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(row)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
      sortable: false,
      filter: false,
      cellStyle: { textAlign: "center" },
    } satisfies ColDef<T>;

    return [...columnDefs, actionsCol];
  }, [columnDefs, onEdit, onDelete, onView, onRecordReading]);

  const defaultColDef = {
    flex: 1,
    minWidth: 150,
    sortable: true,
    resizable: true,
    filter: true,
  };

  const gridTheme = themeQuartz.withParams({
    borderRadius: 2,
    headerFontSize: 14,
    wrapperBorderRadius: "0.5rem",
    backgroundColor: "#0a0a0a",
    browserColorScheme: "dark",
    foregroundColor: "#fafafa",
    rowHoverColor: "#171717",
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-end md:items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <InputGroup className="w-full md:max-w-sm">
            <InputGroupAddon>
              <Search className="w-full" />
            </InputGroupAddon>
            <InputGroupInput
              className="w-full"
              placeholder={"Search ..."}
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="flex flex-row justify-end items-center gap-4 md:gap-2">
          <PdfExport
            filename={`${buttonName ? buttonName : "data"}.pdf`}
            title={`${buttonName ? buttonName : "Data"} Report`}
            // Cast rowData to the generic ExportRow[] shape for the PDF exporter
            rows={rowData as unknown as import("@/types/Export").ExportRow[]}
            columns={columnDefs
              .map((c) => (c.field ? String(c.field) : ""))
              .filter(Boolean)}
          />
          <Button
            variant={"default"}
            size={"sm"}
            onClick={onCreate}
            className={
              buttonName === "Rate" || buttonName === "Reading" ? "hidden" : ""
            }
          >
            <PlusIcon size={16} />
            {`Add ${buttonName ? buttonName : ""}`}
          </Button>
        </div>
      </div>
      <div style={{ height }} className="w-full">
        <AgGridReact<T>
          theme={gridTheme}
          rowData={rowData}
          columnDefs={columnWithActions}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          cacheQuickFilter={true}
          includeHiddenColumnsInQuickFilter={false}
          domLayout={"autoHeight"}
        />
      </div>
    </div>
  );
};

export default GridTable;
