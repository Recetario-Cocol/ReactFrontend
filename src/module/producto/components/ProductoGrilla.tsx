import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState, SyntheticEvent } from "react";
import { Box, Button, Snackbar, SnackbarCloseReason } from "@mui/material";
import PaqueteFormModal, { AlertDialogBorrarProducto } from "./ProductoFormModal";
import { useProductoService } from "../useProductoService";
import { useUnidadService } from "../../unidad/useUnidadService";
import Producto from "../Producto";
import HeaderApp from "../../core/components/HeaderApp";
import { useAuth } from "../../contexts/AuthContext";
import { usePermisos } from "../../contexts/Permisos";

interface Row {
  id: number;
  nombre: string;
  unidadId: number;
  precio: number;
  cantidad: string;
  nombreUnidad: string;
  can_be_deleted: boolean;
}

export default function ProductoGrilla() {
  const [estaSelecionado, setEstaSelecionado] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarProducto, setOpenBorrarProducto] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [canBeDelete, setCanBeDelete] = useState(false);
  const [columnVisibilityModel] = useState<GridColumnVisibilityModel>({
    can_be_deleted: false,
    id: false,
  });
  const [mensajesModalBorrar, setMensajesModalBorrar] = useState<string>("");
  const ProductoService = useProductoService();
  const UnidadService = useUnidadService();
  const { change_producto, add_producto, delete_producto } = usePermisos();
  const { hasPermission } = useAuth();

  const handleSeleccion = (rowSelectionModel: GridRowSelectionModel) => {
    setEstaSelecionado(rowSelectionModel.ids.size > 0);
    const firstSelectedRow = Array.from(rowSelectionModel.ids)[0];
    const selectedRow = rows.find((row: Row) => row.id === firstSelectedRow);
    setCanBeDelete(!!selectedRow?.can_be_deleted);
  };

  const handleCloseModal = () => {
    fetchRows();
    setOpenModal(false);
  };

  const handleCloseDialog = (mensaje: string) => {
    fetchRows();
    setOpenBorrarProducto(false);
    setMensajesModalBorrar(mensaje);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    try {
      const result = await ProductoService.getAll();
      if (result) {
        const productoFormApi = await Promise.all(
          result.map(async (item: Producto) => {
            const unidadResult = await UnidadService.getUnidad(item.unidadId);
            return {
              id: item.id,
              nombre: item.nombre,
              unidadId: item.unidadId,
              precio: item.precio,
              cantidad: item.cantidad + " " + unidadResult.abreviacion,
              nombreUnidad: unidadResult.nombre,
              can_be_deleted: item.can_be_deleted,
            };
          }),
        );
        setRows(productoFormApi);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      setRows([]);
    }
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "Id", width: 30 },
    {
      field: "nombre",
      headerName: "Nombre",
      width: 200,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      width: 100,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "precio",
      headerName: "Precio",
      width: 100,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "can_be_deleted",
      headerName: "can_be_deleted",
      width: 150,
      editable: false,
      disableColumnMenu: true,
    },
  ];

  function getSelectedRowId(): number {
    if (GrillaRef.current) {
      const selectedRows = GrillaRef.current.getSelectedRows();
      if (selectedRows && selectedRows.size > 0) {
        const firstSelectedRow = selectedRows.entries().next().value?.[0] ?? 0;
        return typeof firstSelectedRow === "number"
          ? firstSelectedRow
          : Number(firstSelectedRow) || 0;
      }
    }
    return 0;
  }

  function agregar(): void {
    setIdToOpen(0);
    setOpenModal(true);
  }

  function modificar(): void {
    setIdToOpen(getSelectedRowId());
    setOpenModal(true);
  }

  function eliminar(): void {
    setIdToOpen(getSelectedRowId());
    setOpenBorrarProducto(true);
  }

  function handleSnackBarClose(_: SyntheticEvent | Event, reason?: SnackbarCloseReason) {
    if (reason === "clickaway") {
      return;
    }
    setMensajesModalBorrar("");
  }

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <HeaderApp titulo="Productos" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          maxWidth: 800,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Button startIcon={<AddIcon />} disabled={!hasPermission(add_producto)} onClick={agregar}>
            Agregar
          </Button>
          <Button
            startIcon={<EditIcon />}
            disabled={!hasPermission(change_producto) || !estaSelecionado}
            onClick={modificar}
          >
            Modificar
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            disabled={!hasPermission(delete_producto) || !canBeDelete}
            onClick={eliminar}
          >
            Eliminar
          </Button>
        </Box>
        <Snackbar
          open={mensajesModalBorrar !== ""}
          autoHideDuration={5000}
          message={mensajesModalBorrar}
          onClose={handleSnackBarClose}
        />
        <Box sx={{ flex: 1 }}>
          <DataGrid
            rows={rows}
            apiRef={GrillaRef}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[10]}
            onRowSelectionModelChange={handleSeleccion}
            disableMultipleRowSelection
            columnVisibilityModel={columnVisibilityModel}
          />
        </Box>
        <>
          {openModal && (
            <PaqueteFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen} />
          )}
          {openBorrarProducto && (
            <AlertDialogBorrarProducto paramId={idToOpen} onClose={handleCloseDialog} />
          )}
        </>
      </Box>
    </Box>
  );
}
