import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFooterContainer,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import Actionbuttons from "../../core/components/ActionButtons";
import Ingrediente from "../Ingrediente";
import Producto from "../../producto/Producto";

export class GrillaIngredientesRow {
  id: number;
  productoId?: number;
  cantidad: number;
  unidadId?: number;
  precio?: string;

  constructor(id: number, cantidad = 0, productoId?: number, unidadId?: number, precio?: string) {
    this.id = id;
    this.cantidad = cantidad;
    this.productoId = productoId;
    this.unidadId = unidadId;
    this.precio = precio;
  }
}

interface GrillaIngredientesProps {
  rowsFromReceta: GrillaIngredientesRow[];
  rindeFromReceta: number;
  productosFromReceta: Producto[];
  onIngredienteAdded: () => void;
  onIngredienteDeleted: () => void;
  onIngredienteEdited: () => void;
  onIngredienteSelecionado: (ingrediente: Ingrediente | undefined) => void;
}

export default function GrillaIngredientes({
  rowsFromReceta,
  rindeFromReceta,
  productosFromReceta,
  onIngredienteAdded,
  onIngredienteDeleted,
  onIngredienteEdited,
  onIngredienteSelecionado,
}: GrillaIngredientesProps) {
  const [rows, setRows] = useState<GrillaIngredientesRow[]>(rowsFromReceta);
  const [total, setTotal] = useState<number>(0);
  const [productos, setProductos] = useState<Producto[]>(productosFromReceta);
  const [isRowSelected, setIsRowSelected] = useState<boolean>(false);
  const [rinde] = useState(rindeFromReceta);

  const [columnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
    unidadId: false,
  });

  const actualizarTotal = () => {
    setTotal(
      rows.reduce((total: number, row: GrillaIngredientesRow) => {
        if (typeof row.precio === "string") {
          const precioNumerico = parseFloat(row.precio.replace(/[^0-9,-]+/g, "").replace(",", "."));
          return total + (isNaN(precioNumerico) ? 0 : precioNumerico);
        }
        return total;
      }, 0),
    );
  };

  useEffect(() => actualizarTotal(), [rows]);

  useEffect(() => setRows(rowsFromReceta), [rowsFromReceta]);

  useEffect(() => setProductos(productosFromReceta), [productosFromReceta]);

  const handleRowSelection = (newSelectionModel: GridRowSelectionModel) => {
    const selectedRowId = Array.from(newSelectionModel.ids)[0];
    const selectedRowData = rows.find((row: GrillaIngredientesRow) => row.id === selectedRowId);
    if (selectedRowData) {
      let cantidad = 0;
      if (typeof selectedRowData.cantidad === "string") {
        const cantidadString: string = selectedRowData.cantidad;
        cantidad = parseFloat(cantidadString.split(" ")[0]) || 0;
      } else if (typeof selectedRowData.cantidad === "number") {
        cantidad = selectedRowData.cantidad;
      }
      onIngredienteSelecionado(
        new Ingrediente(
          Number(selectedRowData.id),
          selectedRowData.productoId,
          selectedRowData.unidadId,
          cantidad,
        ),
      );
      setIsRowSelected(true);
    } else {
      setIsRowSelected(false);
      onIngredienteSelecionado(undefined);
    }
  };

  const CustomFooter = ({ total, rinde }: { total: number; rinde: number }) => {
    const totalAsString = (subtotal?: number) => {
      return (subtotal ?? total).toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      });
    };

    return (
      <GridFooterContainer>
        <Box sx={{ p: 1, display: "flex", justifyContent: "end" }}>
          <Typography variant="body2">
            Total: {totalAsString()} <br />
            Por Porción: {totalAsString(total / (rinde || 1))}
          </Typography>
        </Box>
      </GridFooterContainer>
    );
  };

  type TypeOfRow = (typeof rows)[number];
  const GrillaRef = useGridApiRef();

  const columns: GridColDef<TypeOfRow>[] = [
    {
      field: "id",
      headerName: "IngredienteId",
      width: 10,
      type: "number",
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "productoId",
      headerName: "Paquete",
      flex: 2,
      minWidth: 150,
      type: "singleSelect",
      editable: true,
      disableColumnMenu: true,
      renderCell: (params) => {
        const producto = productos.find((p: Producto) => p.id === params.value);
        return producto ? producto.nombre : "Seleccionar producto";
      },
    },
    {
      field: "unidadId",
      headerName: "unidadId",
      width: 100,
      editable: false,
      disableColumnMenu: true,
      valueGetter: (_, row) => {
        const producto = productos.find((p: Producto) => p.id === row.productoId);
        return producto?.unidadId;
      },
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      flex: 1,
      minWidth: 100,
      type: "number",
      editable: true,
      disableColumnMenu: true,
    },
    {
      field: "precio",
      headerName: "Precio",
      flex: 1,
      minWidth: 100,
      editable: false,
      disableColumnMenu: true,
    },
  ];

  return (
    <>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Ingredientes
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
        }}>
        <Actionbuttons
          agregar={{
            isDisabled: false,
            onClick: onIngredienteAdded,
            sx: {
              display: { xs: "flex", md: "inline-flex" },
              minWidth: { xs: "auto", md: "64px" },
              justifyContent: "center",
            },
          }}
          modificar={{
            isDisabled: !isRowSelected,
            onClick: onIngredienteEdited,
            sx: {
              display: { xs: "flex", md: "inline-flex" },
              minWidth: { xs: "auto", md: "64px" },
              justifyContent: "center",
            },
          }}
          borrar={{
            isDisabled: !isRowSelected,
            onClick: onIngredienteDeleted,
            sx: {
              display: { xs: "flex", md: "inline-flex" },
              minWidth: { xs: "auto", md: "64px" },
              justifyContent: "center",
            },
          }}
        />
      </Box>
      <DataGrid
        rows={rows}
        apiRef={GrillaRef}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: -1,
            },
          },
        }}
        sx={{ height: "50vh" }}
        onRowSelectionModelChange={handleRowSelection}
        columnVisibilityModel={columnVisibilityModel}
        slots={{
          footer: () => <CustomFooter total={total} rinde={rinde ?? 1} />,
        }}
      />
    </>
  );
}
