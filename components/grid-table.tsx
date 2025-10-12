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
import { Eye, Pencil, Trash2, Search, FileText, PlusIcon } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface GridTableProps<T extends object> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  onEdit?: (row: T) => void;
  onView?: (row: T) => void;
  onDelete?: (row: T) => void;
  onCreate?: () => void;
  height?: number;
  width?: number;
}

const GridTable = <T extends object>({
  rowData,
  columnDefs,
  onEdit,
  onView,
  onDelete,
  onCreate,
  height = 480,
}: // width = 800,
GridTableProps<T>) => {
  const [quickFilterText, setQuickFilterText] = useState("");

  const columnWithActions = useMemo<ColDef<T>[]>(() => {
    const actionsCol: ColDef<T> = {
      headerName: "Actions",
      width: 160,
      cellRenderer: (params: ICellRendererParams<T>) => {
        const row = params.data;
        if (!row) return null;

        return (
          <div className="flex flex-row justify-center gap-2 items-center h-full">
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
  }, [columnDefs, onEdit, onDelete, onView]);

  const defaultColDef = {
    flex: 1,
    sortable: true,
    resizable: true,
    filter: true,
  };

  const gridTheme = themeQuartz.withParams({
    backgroundColor: "#0a0a0a",
    borderRadius: 2,
    browserColorScheme: "dark",
    foregroundColor: "#fafafa",
    headerFontSize: 14,
    wrapperBorderRadius: "0.5rem",
    rowHoverColor: "#171717",
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <Search className="" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={"Search ..."}
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="flex flex-row justify-end items-center gap-2">
          <Button variant={"secondary"} size={"sm"} onClick={() => {}}>
            <FileText size={16} />
            {"Export PDF"}
          </Button>
          <Button variant={"default"} size={"sm"} onClick={onCreate}>
            <PlusIcon size={16} />
            {"Add Room"}
          </Button>
        </div>
      </div>
      <div style={{ height, width: "full" }}>
        <AgGridReact<T>
          theme={gridTheme}
          rowData={rowData}
          columnDefs={columnWithActions}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          cacheQuickFilter={true}
          includeHiddenColumnsInQuickFilter={false}
        />
      </div>
    </div>
  );
};

export default GridTable;
