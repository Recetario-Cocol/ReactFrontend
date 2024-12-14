import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton} from '@mui/material';
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
  
  const handleClose = () => {
    if(onClose) onClose();
    setOpen(false);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="ID"
          name="id"
          value={form.id}
          fullWidth
          margin="normal"
          disabled
        />
        <TextField
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={e => setForm((prevForm) => new Unidad(prevForm.id, e.target.value || '', prevForm.abreviacion))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Abreviación"
          name="abreviacion"
          value={form.abreviacion}
          onChange={e => setForm((prevForm) => new Unidad(prevForm.id, prevForm.nombre, e.target.value || ''))}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">Enviar</Button>
        <Button variant="outlined" color="error" onClick={handleClose}>Cancelar</Button>
      </Box>
    </Box>
  </Modal>;
}
  

type AlertDialogBorrarUnidadProps = {
  paramId: number;
  onClose?: () => void;
};

export function AlertDialogBorrarUnidad({ paramId, onClose }: AlertDialogBorrarUnidadProps): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(true);
  const [id,] = React.useState<number>(paramId);
  const UnidadService = useUnidadService();

  const handlerClickSi = () => {
    UnidadService.eliminarUnidad(id).then().then(
      ()=>handleClose()
    );
  }
  const handleClose = () => {
    if(onClose) onClose();
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" >
        <DialogTitle id="alert-dialog-title">
          {"¿Desea Borrar la Unidad?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>No</Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
