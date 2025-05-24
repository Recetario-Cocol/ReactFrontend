import React from "react";
import { Button } from "@mui/material";
import { useUserService } from "../useUserService";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

export type AlertDialogBorrarUsuarioProps = {
  paramId: number;
  onClose?: (mensaje: string) => void;
  forced?: boolean;
};

export default function AlertDialogBorrarUsuario({
  paramId,
  onClose,
  forced,
}: AlertDialogBorrarUsuarioProps): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(true);
  const [confirmAgain, setConfirmAgain] = React.useState<boolean>(false);
  const [id] = React.useState<number>(paramId);
  const userService = useUserService();

  const handleFirstConfirmation = () => {
    if (forced) {
      setConfirmAgain(true);
      setOpen(false);
    } else {
      handleDelete();
    }
  };

  const handleDelete = async () => {
    try {
      await userService.eliminarUsuario(id, forced);
      handleClose("Usuario eliminado correctamente.");
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al intentar eliminar el Usuario.";
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response) {
        const { status } = axiosError.response;
        if (status === 409) {
          mensajeError =
            "No se puede eliminar el usuario porque está relacionado con otros recursos.";
        } else if (status === 404) {
          mensajeError = "El usuario que intentas eliminar no existe.";
        }
      } else {
        mensajeError = "Error de conexión. Intenta de nuevo más tarde.";
      }
      handleClose(mensajeError);
    }
  };

  const handleClose = (mensaje: string) => {
    if (onClose) onClose(mensaje);
    setOpen(false);
    setConfirmAgain(false);
  };

  return (
    <>
      <Dialog open={open} onClose={() => handleClose("")} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">{"¿Desea Borrar el Usuario?"}</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleClose("")} autoFocus>
            No
          </Button>
          <Button onClick={handleFirstConfirmation}>Sí</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmAgain}
        onClose={() => handleClose("")}
        aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">
          {
            "Esta acción es irreversible. ¿Seguro que desea borrar el Usuario y Todas las entidades de este usuario?"
          }
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => handleClose("")} autoFocus>
            No
          </Button>
          <Button onClick={handleDelete}>Sí, eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
