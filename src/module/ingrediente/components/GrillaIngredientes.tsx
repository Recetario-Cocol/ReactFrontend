import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import Actionbuttons from "../../core/components/ActionButtons";
import Ingrediente from "../Ingrediente";
import Producto from "../../producto/Producto";
import IngredienteModal, {
  AlertDialogBorrarIngrediente,
} from "../../ingrediente/components/IngredienteModal";
import { Unidad } from "../../unidad/Unidad";

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

const actionbuttonsStile = {
  display: { xs: "flex", md: "inline-flex" },
  minWidth: { xs: "auto", md: "64px" },
  justifyContent: "center",
};

export interface GrillaIngredientesInputProps {
  value: GrillaIngredientesRow[];
  onChange: (rows: GrillaIngredientesRow[]) => void;
  rindeFromReceta: number;
  productosFromReceta: Producto[];
  unidadesFromReceta: Unidad[];
}

export default function GrillaIngredientesInput({
  value,
  onChange,
  productosFromReceta,
  unidadesFromReceta,
}: GrillaIngredientesInputProps) {
  const [productos, setProductos] = useState<Producto[]>(productosFromReceta);
  const [unidades, setUnidad] = useState<Unidad[]>(unidadesFromReceta);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [openIngredienteModal, setOpenIngredienteModal] = useState(false);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | undefined>(
    undefined,
  );
  const [ingredienteIdToDelete, setIngredienteIdToDelete] = useState<number>(0);
  const [openBorrarIngrediente, setOpenBorrarIngrediente] = useState(false);

  const handleIngredienteCloseDialogClose = () => {
    setOpenBorrarIngrediente(false);
  };

  const handleIngredienteCloseDialog = (id: number) => {
    if (id == null) return;
    const nuevasFilas = value.filter((row) => row.id !== id);
    onChange(nuevasFilas);
    setSelectedRowId(null);
  };

  const onHanderSubmitIngrediente = (ingrediente: Ingrediente | undefined) => {
    if (ingrediente) addRowFromIngrediente(ingrediente);
  };

  const addRowFromIngrediente = (ingrediente: Ingrediente) => {
    const producto = productos.find((row: Producto) => row.id === ingrediente.productoId);
    const unidad = unidades.find((row: Unidad) => row.id === producto?.unidadId);
    const precio = ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;
    const newRow: GrillaIngredientesRow = {
      id: ingrediente.id,
      productoId: ingrediente.productoId,
      unidadId: ingrediente.unidadId,
      cantidad: ingrediente.cantidad + (unidad ? " " + unidad?.abreviacion : ""),
      precio: precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      }),
    };
    const existingRowIndex = value.findIndex((row: GrillaIngredientesRow) => row.id === newRow.id);
    if (existingRowIndex !== -1) {
      const updatedRows = [...value];
      updatedRows[existingRowIndex] = newRow;
      onChange(updatedRows);
    } else {
      onChange([...value, newRow]);
    }
  };

  const handleCloseIngredienteModal = () => {
    setOpenIngredienteModal(false);
  };

  const agregarIngrediente = () => {
    setIngredienteSeleccionado(undefined);
    setOpenIngredienteModal(true);
  };

  const modificarIngrediente = () => {
    setOpenIngredienteModal(true);
  };

  const eliminarIngrediente = () => {
    if (ingredienteSeleccionado?.id) {
      setIngredienteIdToDelete(ingredienteSeleccionado.id);
      setOpenBorrarIngrediente(true);
    }
  };

  const [columnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
    unidadId: false,
  });

  useEffect(() => setProductos(productosFromReceta), [productosFromReceta]);
  useEffect(() => setUnidad(unidadesFromReceta), [unidadesFromReceta]);

  const handleRowSelection = (newSelectionModel: GridRowSelectionModel) => {
    const selectedRowId = Array.from(newSelectionModel.ids)[0];
    const selectedRowData = value.find((row: GrillaIngredientesRow) => row.id === selectedRowId);
    setSelectedRowId(selectedRowId ? Number(selectedRowId) : null);
    if (selectedRowData) {
      let cantidad = 0;
      if (typeof selectedRowData.cantidad === "string") {
        const cantidadString: string = selectedRowData.cantidad;
        cantidad = parseFloat(cantidadString.split(" ")[0]) || 0;
      } else if (typeof selectedRowData.cantidad === "number") {
        cantidad = selectedRowData.cantidad;
      }
      setIngredienteSeleccionado(
        new Ingrediente(
          Number(selectedRowData.id),
          selectedRowData.productoId,
          selectedRowData.unidadId,
          cantidad,
        ),
      );
    } else {
      setIngredienteSeleccionado(undefined);
    }
  };

  type TypeOfRow = (typeof value)[number];
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
      valueOptions: productos.map((p) => ({ value: p.id, label: p.nombre })),
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
            onClick: agregarIngrediente,
            sx: actionbuttonsStile,
          }}
          modificar={{
            isDisabled: !selectedRowId,
            onClick: modificarIngrediente,
            sx: actionbuttonsStile,
          }}
          borrar={{
            isDisabled: !selectedRowId,
            onClick: eliminarIngrediente,
            sx: actionbuttonsStile,
          }}
        />
      </Box>
      <DataGrid
        rows={value}
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
        getRowClassName={(params) => `fila-ingrediente-${params.id}`}
      />
      <Box>
        {openIngredienteModal && (
          <IngredienteModal
            openArg={openIngredienteModal}
            onSubmit={onHanderSubmitIngrediente}
            ingredienteParam={ingredienteSeleccionado}
            unidadesParam={unidadesFromReceta}
            productosParam={productos}
            onClose={handleCloseIngredienteModal}
          />
        )}
        {openBorrarIngrediente && (
          <AlertDialogBorrarIngrediente
            paramId={ingredienteIdToDelete}
            onSubmit={handleIngredienteCloseDialog}
            onClose={handleIngredienteCloseDialogClose}
          />
        )}
      </Box>
    </Box>
  );
}
