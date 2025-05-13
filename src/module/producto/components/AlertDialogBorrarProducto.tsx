import { useState, Fragment } from "react";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { useProductoService } from "../useProductoService";

type AlertDialogBorrarProductoProps = {
  paramId: number;
  onClose?: (mensaje: string) => void;
};

export default function AlertDialogBorrarProducto({
  paramId,
  onClose,
}: AlertDialogBorrarProductoProps): React.JSX.Element {
  const [open, setOpen] = useState(true);
  const [id] = useState(paramId);
  const ProductoService = useProductoService();

  const handlerClickSi = async () => {
    try {
      await ProductoService.eliminar(id);
      handleClose("Producto eliminado correctamente.");
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al intentar eliminar el producto.";
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response) {
        const { status } = axiosError.response;
        if (status === 409) {
          mensajeError =
            "No se puede eliminar el producto porque está relacionada con alguna receta.";
        } else if (status === 404) {
          mensajeError = "El producto que intentas eliminar no existe.";
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
        <DialogTitle id="alert-dialog-title">{"¿Desea Borrar el Paquete?"}</DialogTitle>
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
