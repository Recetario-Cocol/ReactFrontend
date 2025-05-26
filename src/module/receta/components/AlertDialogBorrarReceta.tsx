import { useState, JSX, Fragment } from "react";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { useRecetaService } from "../useRecetaService";
type AlertDialogBorrarRecetaProps = {
  paramId: number;
  onClose?: (mensaje: string) => void;
};

export default function AlertDialogBorrarReceta({
  paramId,
  onClose,
}: AlertDialogBorrarRecetaProps): JSX.Element {
  const [open, setOpen] = useState(true);
  const [id] = useState(paramId);
  const RecetaService = useRecetaService();

  const handlerClickSi = () => {
    RecetaService.eliminar(id)
      .then(() => handleClose("Receta eliminada correctamente."))
      .catch(() => {
        handleClose("Error al intentar borra la receta. Intenta de nuevo más tarde.");
      });
  };

  const handleClose = (mensaje: string | React.MouseEvent) => {
    if (typeof mensaje === "string") {
      if (onClose) onClose(mensaje);
    } else {
      if (onClose) onClose("");
    }
    setOpen(false);
  };

  return (
    <Fragment>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">{"¿Desea Borrar la Receta?"}</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            No
          </Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
