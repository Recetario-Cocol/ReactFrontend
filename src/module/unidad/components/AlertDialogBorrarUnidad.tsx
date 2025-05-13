import { useState, JSX, Fragment } from "react";
import { Button } from "@mui/material";
import { useUnidadService } from "../useUnidadService";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

type AlertDialogBorrarUnidadProps = {
  paramId: number;
  onClose?: (mensaje: string) => void;
};

export default function AlertDialogBorrarUnidad({
  paramId,
  onClose,
}: AlertDialogBorrarUnidadProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(true);
  const [id] = useState<number>(paramId);
  const UnidadService = useUnidadService();

  const handlerClickSi = async () => {
    try {
      await UnidadService.eliminarUnidad(id);
      handleClose("Unidad eliminada correctamente.");
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al intentar eliminar la unidad.";
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response) {
        const { status } = axiosError.response;
        if (status === 409) {
          mensajeError =
            "No se puede eliminar la unidad porque está relacionada con otros recursos.";
        } else if (status === 404) {
          mensajeError = "La unidad que intentas eliminar no existe.";
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
  };

  return (
    <Fragment>
      <Dialog open={open} onClose={() => handleClose("")} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">{"¿Desea Borrar la Unidad?"}</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleClose("")} autoFocus>
            No
          </Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
