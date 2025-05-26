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
  cantidad: string;
  unidadId?: number;
  precio?: string;

  constructor(
    id: number,
    cantidad: string = "",
    productoId?: number,
    unidadId?: number,
    precio?: string,
  ) {
    this.id = id;
    this.cantidad = cantidad;
    this.productoId = productoId;
    this.unidadId = unidadId;
    this.precio = precio;
  }
}

export interface GrillaIngredientesProps {
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
  const [total, setTotal] = useState<number>(0);
  const [productos, setProductos] = useState<Producto[]>(productosFromReceta);
  const [isRowSelected, setIsRowSelected] = useState<boolean>(false);

  const [columnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
    unidadId: false,
  });

  const actualizarTotal = () => {
    setTotal(
      rowsFromReceta.reduce((total: number, row: GrillaIngredientesRow) => {
        if (typeof row.precio === "string") {
          const precioNumerico = parseFloat(row.precio.replace(/[^0-9,-]+/g, "").replace(",", "."));
          return total + (isNaN(precioNumerico) ? 0 : precioNumerico);
        }
        return total;
      }, 0),
    );
  };

  useEffect(() => {
    actualizarTotal();
  }, [rowsFromReceta]);

  useEffect(() => setProductos(productosFromReceta), [productosFromReceta]);

  const handleRowSelection = (newSelectionModel: GridRowSelectionModel) => {
    const selectedRowId = Array.from(newSelectionModel.ids)[0];
    const selectedRowData = rowsFromReceta.find(
      (row: GrillaIngredientesRow) => row.id === selectedRowId,
    );
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
        <Box sx={{ p: 1, display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Typography variant="body2">
            Por Porción: {totalAsString(total / (rinde || 1))}
          </Typography>
          <Typography variant="body2">Total: {totalAsString()}</Typography>
        </Box>
      </GridFooterContainer>
    );
  };

  type TypeOfRow = (typeof rowsFromReceta)[number];
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
      headerName: "Productos",
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
      type: "string",
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
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", minHeight: 400 }}>
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
        rows={rowsFromReceta}
        apiRef={GrillaRef}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: -1,
            },
          },
        }}
        onRowSelectionModelChange={handleRowSelection}
        columnVisibilityModel={columnVisibilityModel}
        slots={{
          footer: () => <CustomFooter total={total} rinde={rindeFromReceta ?? 1} />,
        }}
      />
    </Box>
  );
}
