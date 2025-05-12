import React, { useEffect, useState, SyntheticEvent } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, FormControl, InputLabel, Alert} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Ingrediente from "../Ingrediente";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { MenuItem} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Producto from '../../producto/Producto';
import { Unidad } from '../../unidad/Unidad';

const generateUniqueNumericId = () => {
  return (-1) * (Date.now() + Math.floor(Math.random() * 1000));
};

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 1,
    maxWidth: '90%'
  };

interface IngredienteModalProps {
  openArg: boolean;
  onSubmit: (ingrediente?: Ingrediente) => void;
  ingredienteParam: Ingrediente | undefined;
  unidades: Unidad[];
  productos: Producto[];
  onClose: () => void;
}
  
export default function IngredienteModal({ openArg, onSubmit, ingredienteParam, unidades, productos, onClose}: IngredienteModalProps) {
  const [ingrediente, setIngrediente] = useState<Ingrediente>(ingredienteParam || new Ingrediente(generateUniqueNumericId()));
  const [id,] = useState<number>(ingrediente.id);
  const [producto, setProducto] = useState<Producto>();
  const [unidad, setUnidad] = useState<Unidad>();
  const [cantidad, setCantidad] = useState(ingrediente.cantidad);
  const [abreviacion, setAbreviacion] = useState<string>('');
  const [precio, setPrecio] = useState<number>(0);
  const [mensajeDeError, setMensajeDeError] = useState<string>("");
  const [open, setOpen] = useState(openArg);    

  const handleClose = (reason?: string) => {
    if (!reason || reason !== 'backdropClick') {
      setOpen(false);
      onClose();
    } 
  };

  const handleCloseOnclick = ( event: SyntheticEvent) => {
    event.stopPropagation();
    handleClose();
  };

  useEffect(() => {
    const selectedProducto = productos.find((p) => p.id === ingrediente.productoId);
    const selectedUnidad = unidades.find((u) => u.id === selectedProducto?.unidadId);
    setProducto(selectedProducto);
    setUnidad(selectedUnidad);
    setAbreviacion(selectedUnidad?.abreviacion ?? '');
    setPrecio(selectedProducto?.precio ?? 0);
  }, [ingrediente.productoId, productos, unidades]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit){
      if (!producto?.id){
        setMensajeDeError("Selecione un producto.");
        return;
      }
      if (!cantidad) {
        setMensajeDeError("Ingrese una cantidad diferente a 0");
        return;
      }
      onSubmit(new Ingrediente(id, producto?.id ?? 0, unidad?.id ?? 0, cantidad));
    }
    handleClose();
  };

  const handleProductoChange = (e: SelectChangeEvent) => {
    setIngrediente((prevIngrediente) => {
      const clonedIngrediente = prevIngrediente.clone();
      clonedIngrediente.productoId = Number(e.target.value);
      return clonedIngrediente;
    });
  };

  return (
    <div>
      <Modal open={open} onClose={handleCloseOnclick}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">Producto
            <IconButton aria-label="close" onClick={handleCloseOnclick} sx={{position: 'absolute', right: 8, top: 8}}><CloseIcon /></IconButton>
          </Typography>
          {mensajeDeError && <Alert severity="success" color="warning">{mensajeDeError}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField label="Id" name="id" value={id} fullWidth margin="normal" disabled  sx={{ width: {xs: '100%', md: '20%'}}}/>
            <FormControl sx={{ width: { xs: '100%', md: 'calc(100% - (20% + 16px))'}, ml: {xs: 0, md: 2}, mt: {xs: 0, md: 2}}}>
              <InputLabel id="producto-label">Producto</InputLabel>
              <Select label="Producto" labelId="producto-label" name="producto" value={producto?.id.toString() ?? "0"} onChange={handleProductoChange} >
                <MenuItem value={"0"}>Seleccione un Paquete</MenuItem>
                {productos.map((paquete : Producto) => (
                  <MenuItem key={paquete.id} value={paquete.id}>
                    {paquete.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Cantidad" name="cantidad" value={cantidad} onChange={(e) => setCantidad( Number(e.target.value))} fullWidth margin="normal"/>
            <TextField label="Unidad" name="abreviacion" value={abreviacion} fullWidth margin="normal" disabled={true} />
            <TextField label="Precio" name="precio" value={precio} fullWidth margin="normal" disabled={true}/>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
              <Button type="submit" variant="contained" color="primary" sx={{m:1}}>Enviar</Button>
              <Button variant="outlined" color="error" onClick={handleCloseOnclick} sx={{m:1}}>Cancelar</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

type AlertDialogBorrarIngredienteProps = {
  paramId: number;
  onSubmit: (id: number) => void;
  onClose: () => void;
};
  
export function AlertDialogBorrarIngrediente({ paramId, onSubmit, onClose }: AlertDialogBorrarIngredienteProps): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  const handlerClickSi = () => {
      onSubmit(paramId);
      handleClose();
  }
  const handleClose = () => {
    setOpen(false);
    onClose();
  }
  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">
          {"¿Desea Borrar el Ingerdiente?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>No</Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
