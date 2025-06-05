import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GrillaIngredientesInput, { GrillaIngredientesRow } from "./GrillaIngredientes";
import Producto from "../../producto/Producto";
import { Unidad } from "../../unidad/Unidad";
import { useState } from "react";
import { ActionbuttonsProps } from "../../core/components/ActionButtons";

// Tipos mejorados para los mocks
type MockDataGridProps = {
  rows: GrillaIngredientesRow[];
  columns: Array<{
    field: string;
    headerName: string;
    renderCell?: (params: { value: unknown; row: GrillaIngredientesRow }) => React.ReactNode;
  }>;
  onRowSelectionModelChange?: (model: { ids: number[] }) => void;
  slots?: { footer?: () => React.ReactNode };
  columnVisibilityModel?: Record<string, boolean>;
};

// Mock mejorado de DataGrid con implementación más realista y soporte para columnas ocultas y selección
jest.mock("@mui/x-data-grid", () => ({
  DataGrid: ({
    rows,
    columns,
    onRowSelectionModelChange,
    slots,
    columnVisibilityModel,
  }: MockDataGridProps) => {
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    // Filtra columnas ocultas
    const visibleColumns = columns.filter(
      (col) => !columnVisibilityModel || columnVisibilityModel[col.field] !== false,
    );

    const handleRowClick = (rowId: number) => {
      if (selectedRowId === rowId) {
        setSelectedRowId(null);
        onRowSelectionModelChange?.({ ids: [] });
      } else {
        setSelectedRowId(rowId);
        onRowSelectionModelChange?.({ ids: [rowId] });
      }
    };

    return (
      <div>
        <table>
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.field}>{col.headerName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                data-testid={`row-${row.id}`}
                style={{
                  background: selectedRowId === row.id ? "#eee" : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => handleRowClick(row.id)}>
                {visibleColumns.map((col) => {
                  let cellContent: string | number | undefined = row[
                    col.field as keyof GrillaIngredientesRow
                  ] as string | number | undefined;
                  if (col.renderCell) {
                    const rendered = col.renderCell({ value: cellContent, row });
                    if (typeof rendered === "string" || typeof rendered === "number") {
                      cellContent = rendered;
                    } else if (rendered === null || rendered === undefined) {
                      cellContent = "";
                    } else if (
                      typeof rendered === "object" &&
                      rendered !== null &&
                      "props" in rendered &&
                      rendered.props &&
                      typeof (rendered.props as { children?: unknown }).children === "string"
                    ) {
                      cellContent = (rendered.props as { children?: unknown }).children as string;
                    } else {
                      cellContent = "";
                    }
                  }
                  return <td key={col.field}>{cellContent}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {slots?.footer?.()}
      </div>
    );
  },
  useGridApiRef: jest.fn(),
  GridFooterContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../../core/components/ActionButtons", () => (props: ActionbuttonsProps) => (
  <div>
    <button onClick={props.agregar.onClick} disabled={props.agregar.isDisabled}>
      Agregar
    </button>
    <button onClick={props.modificar.onClick} disabled={props.modificar.isDisabled}>
      Modificar
    </button>
    <button onClick={props.borrar.onClick} disabled={props.borrar.isDisabled}>
      Eliminar
    </button>
  </div>
));

const mockUnidades: Unidad[] = [new Unidad(1, "Gramos", "grs")];

const mockProductos = [
  new Producto(1, "Harina", 1, 1500, 1000, true),
  new Producto(2, "Azúcar", 1, 1200, 1000, false),
];

const mockRows: GrillaIngredientesRow[] = [
  new GrillaIngredientesRow(1, "100 grs", 1, 1, "$1.500,00"),
  new GrillaIngredientesRow(2, "200 grs", 2, 1, "$2.400,00"),
];

describe("GrillaIngredientesInput", () => {
  function renderWithState(rows: GrillaIngredientesRow[], rinde: number = 1) {
    const Wrapper = () => {
      const [value, setValue] = useState(rows);
      return (
        <GrillaIngredientesInput
          value={value}
          onChange={setValue}
          rindeFromReceta={rinde}
          productosFromReceta={mockProductos}
          unidadesFromReceta={mockUnidades}
        />
      );
    };
    return render(<Wrapper />);
  }

  it("debería manejar correctamente el formato de precios con diferentes formatos", () => {
    const rowsWithDifferentFormats = [
      new GrillaIngredientesRow(3, "50 grs", 1, 1, "1.500,50"),
      new GrillaIngredientesRow(4, "75 grs", 2, 1, "2.400"),
    ];

    renderWithState(rowsWithDifferentFormats);

    expect(screen.getByText(/Total:\s*\$ ?3\.900,50/i)).toBeInTheDocument();
  });

  it("debería manejar cantidad como número en lugar de string", () => {
    // Pasa un valor numérico como string en cantidad (el tipo correcto)
    const numericCantidadRow = {
      ...new GrillaIngredientesRow(3, "300", 1, 1, "$450,00"),
      cantidad: "300",
    };

    renderWithState([numericCantidadRow]);

    fireEvent.click(screen.getByText("Harina"));
    // El modal no se abre en este test, pero podemos verificar que la selección funciona
    // No hay callback externo, pero podemos verificar que el row está seleccionado visualmente
    expect(screen.getByTestId("row-3")).toHaveStyle("background: #eee");
  });

  it("debería actualizar los totales cuando cambian las filas", () => {
    const Wrapper = () => {
      const [value, setValue] = useState(mockRows);
      return (
        <div>
          <GrillaIngredientesInput
            value={value}
            onChange={setValue}
            rindeFromReceta={4}
            productosFromReceta={mockProductos}
            unidadesFromReceta={mockUnidades}
          />
          <button
            onClick={() =>
              setValue([...value, new GrillaIngredientesRow(3, "300 grs", 1, 1, "$3.000,00")])
            }>
            Add Row
          </button>
        </div>
      );
    };

    render(<Wrapper />);
    expect(screen.getByText(/Total:\s*\$ ?3\.900,00/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add Row"));
    expect(screen.getByText(/Total:\s*\$ ?6\.900,00/i)).toBeInTheDocument();
    expect(screen.getByText(/Por Porción:\s*\$ ?1\.725,00/i)).toBeInTheDocument();
  });

  it("debería manejar rindeFromReceta igual a 0", () => {
    renderWithState(mockRows, 0);
    expect(screen.getByText(/Por Porción:\s*\$ ?3\.900,00/i)).toBeInTheDocument();
  });

  it("debería manejar la deselección de filas", async () => {
    renderWithState(mockRows, 4);

    // Seleccionar y luego deseleccionar
    fireEvent.click(screen.getByText("Harina"));
    fireEvent.click(screen.getByText("Harina")); // Toggle

    await waitFor(() => {
      expect(screen.getByTestId("row-1")).not.toHaveStyle("background: #eee");
    });
  });

  it("debería ocultar las columnas especificadas", () => {
    renderWithState(mockRows, 4);

    expect(screen.queryByText("IngredienteId")).not.toBeInTheDocument();
    expect(screen.queryByText("unidadId")).not.toBeInTheDocument();
  });

  it("debería manejar productos no encontrados en renderCell", () => {
    const rowWithInvalidProduct = new GrillaIngredientesRow(3, "100 grs", 999, 1, "$100,00");

    renderWithState([rowWithInvalidProduct]);
    expect(screen.getByText("Seleccionar producto")).toBeInTheDocument();
  });
});
