import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useUnidadService } from '../../unidad/useUnidadService';
import Producto from '../Producto';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { MenuItem} from "@mui/material";
import { useProductoService } from '../useProductoService';

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

export default function PaqueteFormModal({ openArg, onClose, idToOpen}: UnidadFormModalProps) {
    const [id,] = useState(idToOpen);
    const [open, setOpen] = useState(openArg);
    const [form, setForm] = useState<Producto>(new Producto());
    const UnidadService = useUnidadService();
    const ProductoService = useProductoService();
    const [unidadesOptions, setUnidadesOptions] = useState([]);
    useEffect(() => {
      if (id) {
        ProductoService.get(id).then((result) => {
          const item :Producto =  result.data;
          const paqueteFromApi = new Producto(item.id || 0, item.nombre || '', item.unidadId || 0, item.precio || 0, item.cantidad || 0);
          setForm(paqueteFromApi);
        });  
      } else {
       setForm(new Producto(0, '', 0, 0, 0));
      }
      UnidadService.getUnidades()
      .then((result) => {
        const options = result.data ? result.data.map((item: any) => ({"id": item.id, "name": item.nombre})) : [];
        setUnidadesOptions(options);
      }); 
    }, [id]);
  
    const handleClose = () => {
      if(onClose) onClose();
      setOpen(false);
    }

    const handlerChangeNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prevForm) => new Producto(prevForm.id,  value || '', prevForm.unidadId, prevForm.precio, prevForm.cantidad));
    }

    const handlerChangeCantidad = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prevForm) => new Producto(prevForm.id,  prevForm.nombre, prevForm.unidadId, prevForm.precio, Number(value) || 0));
    }

    const handleChangeUnidad = (event: SelectChangeEvent<number | string>) => {
      const { value } = event.target;
      setForm((prevForm) => new Producto(prevForm.id,  prevForm.nombre, Number(value) || 0, prevForm.precio, prevForm.cantidad));
    };

    const handlerChangePrecio = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prevForm) => new Producto(prevForm.id,  prevForm.nombre, prevForm.unidadId, Number(value) || 0, prevForm.cantidad));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (id) {
        ProductoService.actualizar(id, form).then(() => handleClose());
      } else {
        ProductoService.crear(form).then(() => handleClose());
      }
    };
  
    return (
      <div>
        <Modal open={open} onClose={handleClose}>
          <Box sx={style}>
            <Typography variant="h6" component="h2">
              Producto
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
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
                onChange={handlerChangeNombre}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Cantidad"
                name="cantidad"
                value={form.cantidad}
                onChange={handlerChangeCantidad}
                fullWidth
                margin="normal"
              />
              <Select
                label="Unidad"
                name="unidad"
                value={form.unidadId}
                onChange={handleChangeUnidad}
                fullWidth
              >
                <MenuItem value={"0"}>Seleccione una unidad</MenuItem>
                {unidadesOptions.map((option : any) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label="Precio"
                name="precio"
                value={form.precio}
                onChange={handlerChangePrecio}
                fullWidth
                margin="normal"
              />
              <Button type="submit" variant="contained" color="primary">
                Enviar
              </Button>
              <Button variant="outlined" color="error" onClick={handleClose}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    );
  }
  

  type AlertDialogBorrarProductoProps = {
    paramId: number;
    onClose?: () => void;
  };

export function AlertDialogBorrarProducto({ paramId, onClose }: AlertDialogBorrarProductoProps): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  const [id,] = React.useState(paramId);
  const ProductoService = useProductoService();

  const handlerClickSi = () => {
    ProductoService.eliminar(id).then().then(()=>handleClose());
  }
  
  const handleClose = () => {
    if(onClose) onClose();
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Desea Borrar el Paquete?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>No</Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
