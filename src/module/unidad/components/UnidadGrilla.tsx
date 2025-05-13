import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { useEffect, useState, SyntheticEvent } from "react";
import { Box, Snackbar, SnackbarCloseReason } from "@mui/material";
import UnidadFormModal from "./unidadFormModal";
import AlertDialogBorrarUnidad from "./AlertDialogBorrarUnidad";
import { useUnidadService } from "../useUnidadService";
import { Unidad } from "../Unidad";
import HeaderApp from "../../core/components/HeaderApp";
import { usePermisos } from "../../contexts/Permisos";
import { useAuth } from "../../contexts/AuthContext";
import Actionbuttons from "../../core/components/ActionButtons";

export default function UnidadGrilla() {
  const [seleccionado, setSeleccionado] = useState(false);
  const [canBeDelete, setCanBeDelete] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUnidad, setOpenBorrarUnidad] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<Unidad[]>([]);
  const UnidadService = useUnidadService();
  const [mensajesModalBorrar, setMensajesModalBorrar] = useState<string>("");
  const [columnVisibilityModel] = useState<GridColumnVisibilityModel>({
    can_be_deleted: false,
    id: false,
  });
  const { change_unidad, add_unidad, delete_unidad } = usePermisos();
  const { hasPermission } = useAuth();

  const handleSeleccion = (rowSelectionModel: GridRowSelectionModel) => {
    const firstId = Array.from(rowSelectionModel.ids)[0];
    const selectedRow = rows.find((row: Unidad) => row.id === firstId);
    setCanBeDelete(!!selectedRow?.can_be_deleted);
    setSeleccionado(rowSelectionModel.ids.size > 0);
    if (selectedRow?.id) setIdToOpen(selectedRow?.id);
  };

  const handleCloseModal = () => {
    fetchRows();
    setOpenModal(false);
  };

  const handleCloseDialog = (mensaje: string) => {
    fetchRows();
    setOpenBorrarUnidad(false);
    setMensajesModalBorrar(mensaje);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  function fetchRows() {
    UnidadService.getUnidades().then((result: Unidad[]) => setRows(result));
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "Id", width: 80, disableColumnMenu: true },
    {
      field: "abreviacion",
      headerName: "Abrev.",
      width: 100,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "nombre",
      headerName: "Nombre",
      width: 200,
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

  function agregar(): void {
    setIdToOpen(0);
    setOpenModal(true);
  }

  function modificar(): void {
    if (seleccionado) setOpenModal(true);
  }

  function eliminar(): void {
    if (seleccionado) setOpenBorrarUnidad(true);
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
      }}>
      <HeaderApp titulo="Unidades" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          maxWidth: 800,
        }}>
        <Actionbuttons
          agregar={{ isDisabled: !hasPermission(add_unidad), onClick: agregar }}
          modificar={{
            isDisabled: !hasPermission(change_unidad) || !seleccionado,
            onClick: modificar,
          }}
          borrar={{ isDisabled: !hasPermission(delete_unidad) || !canBeDelete, onClick: eliminar }}
        />
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
            disableMultipleRowSelection
            pageSizeOptions={[10]}
            onRowSelectionModelChange={handleSeleccion}
            columnVisibilityModel={columnVisibilityModel}
          />
        </Box>
        <div>
          {openModal && (
            <UnidadFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen} />
          )}
          {openBorrarUnidad && (
            <AlertDialogBorrarUnidad paramId={idToOpen} onClose={handleCloseDialog} />
          )}
        </div>
      </Box>
    </Box>
  );
}
