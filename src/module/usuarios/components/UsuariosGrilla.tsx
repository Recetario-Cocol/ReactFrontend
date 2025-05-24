import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  SnackbarCloseReason,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Usuario } from "../Usuario";
import HeaderApp from "../../core/components/HeaderApp";
import { useUserService } from "../useUserService";
import UserFormModal from "./UsuarioFormModal";
import AlertDialogBorrarUsuario from "./AlertDialogBorrarUsuario";
import { useAuth } from "../../contexts/AuthContext";
import Actionbuttons from "../../core/components/ActionButtons";

export default function UsuariosGrilla() {
  const [seleccionado, setSeleccionado] = React.useState(false);
  const [can_be_deleted, setCan_be_deleted] = React.useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUsuario, setOpenBorrarUsuario] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<Usuario[]>([]);
  const UserService = useUserService();
  const [mensajesModalBorrar, setMensajesModalBorrar] = useState<string>("");
  const [columnVisibilityModel] = React.useState<GridColumnVisibilityModel>({
    can_be_deleted: false,
    id: false,
  });
  const { isAdmin, forgotPassword } = useAuth();
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);

  const handleSeleccion = (rowSelectionModel: GridRowSelectionModel) => {
    const firstId = Array.from(rowSelectionModel.ids)[0];
    const selectedRow = rows.find((row: Usuario) => row.id === firstId);

    setCan_be_deleted(!!selectedRow?.can_be_deleted);
    setSeleccionado(rowSelectionModel.ids.size > 0);
  };

  const handleCloseModal = () => {
    fetchRows();
    setOpenModal(false);
  };

  const handleCloseDialog = (mensaje: string) => {
    fetchRows();
    setOpenBorrarUsuario(false);
    setMensajesModalBorrar(mensaje);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  function fetchRows() {
    UserService.getUsuarios().then((result: Usuario[]) => setRows(result));
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "Id", width: 80, disableColumnMenu: true },
    {
      field: "name",
      headerName: "Name",
      width: 100,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "email",
      headerName: "Email",
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

  function modificar() {
    setIdToOpen(getSelectedRowId());
    setOpenModal(true);
  }

  function eliminar() {
    setIdToOpen(getSelectedRowId());
    setOpenBorrarUsuario(true);
  }

  function limpiarContrasenias() {
    setOpenForgotPasswordModal(true);
  }

  function handleForgotPasswordConfirm() {
    const id = getSelectedRowId();
    if (id) {
      forgotPassword(id);
    }
    setOpenForgotPasswordModal(false);
  }

  function handleForgotPasswordCancel() {
    setOpenForgotPasswordModal(false);
  }

  function handleSnackBarClose(_: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) {
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
      <HeaderApp titulo="Usuarios" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          maxWidth: 800,
        }}>
        <Actionbuttons
          agregar={{ isDisabled: true, onClick: () => {} }}
          modificar={{ isDisabled: !isAdmin || !seleccionado, onClick: modificar }}
          borrar={{ isDisabled: !isAdmin || !can_be_deleted, onClick: eliminar }}
          borrarConDependencias={{ isDisabled: !isAdmin || !seleccionado, onClick: eliminar }}
          limpiarContrasenias={{
            isDisabled: !isAdmin || !seleccionado,
            onClick: limpiarContrasenias,
          }}
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
            <UserFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen} />
          )}
          {openBorrarUsuario && (
            <AlertDialogBorrarUsuario
              paramId={idToOpen}
              onClose={handleCloseDialog}
              forced={!can_be_deleted}
            />
          )}
        </div>
      </Box>

      <Dialog open={openForgotPasswordModal} onClose={handleForgotPasswordCancel}>
        <DialogTitle>Confirmar Restablecimiento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas enviar un correo para restablecer la contraseña?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleForgotPasswordCancel} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleForgotPasswordConfirm} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
