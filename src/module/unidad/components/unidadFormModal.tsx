import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Alert, Snackbar} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useUnidadService } from '../useUnidadService';
import { Unidad } from '../Unidad';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface UnidadFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function UnidadFormModal({openArg, onClose, idToOpen}: UnidadFormModalProps) {
  const [id,] = useState<number>(idToOpen);
  const [open, setOpen] = useState<boolean>(openArg);
  const [form, setForm] = useState<Unidad>(new Unidad());
  const [mensajeDeError, setMensajeDeError] = useState<String>("");
  const UnidadService = useUnidadService();
  
  useEffect(() => {
    if (id) {
      UnidadService.getUnidad(id).then((result) => {
        const item =  result.data;
        const unidadesApi = new Unidad(item.id, item.nombre, item.abreviacion);
        setForm(unidadesApi);
      });  
    } else {
      setForm(new Unidad(0, '', ''));
    }
  }, [id]);
  
  
  const handleClose = (event?: any, reason?: string) => {
    if (!reason || reason !== 'backdropClick') {
      if(onClose) onClose();
      setOpen(false);
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!form.nombre) {
      setMensajeDeError("Ingrese un nombre.");
      return;
    }

    if (!form.abreviacion) {
      setMensajeDeError("Ingrese una abreviacion");
      return;
    }
  
    if (id) {
      UnidadService.actualizarUnidad(id, form).then(
        ()=>handleClose()
      );
    } else {
      UnidadService.crearUnidad(form).then(
        ()=>handleClose()
      );
    }
  };
  
  return <Modal open={open} onClose={handleClose}>
    <Box sx={style}>
      <Typography variant="h6" component="h2">
        Unidad
        <IconButton aria-label="close" onClick={handleClose} sx={{position: 'absolute', right: 8, top: 8}}>
          <CloseIcon />
        </IconButton>
      </Typography>
      {mensajeDeError && <Alert severity="success" color="warning">{mensajeDeError}</Alert>}    
      <Box component="form" onSubmit={handleSubmit}>
        <TextField label="ID" name="id" value={form.id} fullWidth margin="normal" disabled/>
        <TextField label="Nombre" name="nombre" value={form.nombre} fullWidth margin="normal"
          onChange={e => setForm((prevForm) => new Unidad(prevForm.id, e.target.value || '', prevForm.abreviacion))}
        />
        <TextField label="Abreviación" name="abreviacion" value={form.abreviacion} fullWidth margin="normal"
          onChange={e => setForm((prevForm) => new Unidad(prevForm.id, prevForm.nombre, e.target.value || ''))}
        />
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
          <Button type="submit" variant="contained" color="primary" sx={{m:1}}>Enviar</Button>
          <Button variant="outlined" color="error" onClick={handleClose} sx={{m:1}}>Cancelar</Button>
        </Box>
      </Box>
    </Box>
  </Modal>;
}
  

type AlertDialogBorrarUnidadProps = {
  paramId: number;
  onClose?: (mensaje: string) => void;
};

export function AlertDialogBorrarUnidad({ paramId, onClose }: AlertDialogBorrarUnidadProps): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(true);
  const [id,] = React.useState<number>(paramId);
  const UnidadService = useUnidadService();

  const handlerClickSi = async () => {
    try {
      await UnidadService.eliminarUnidad(id);
      handleClose("Unidad eliminada correctamente.");
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al intentar eliminar la unidad.";
      if (error.response) {
        const { status } = error.response; 
        if (status === 409) {
          mensajeError = "No se puede eliminar la unidad porque está relacionada con otros recursos.";
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
    if(onClose) onClose(mensaje);
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Dialog open={open} onClose={() => handleClose("")} aria-labelledby="alert-dialog-title" >
        <DialogTitle id="alert-dialog-title">
          {"¿Desea Borrar la Unidad?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => handleClose("")} autoFocus>No</Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
 