import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputLabel,
  FormControl,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUnidadService } from "../../unidad/useUnidadService";
import Producto from "../Producto";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { MenuItem } from "@mui/material";
import { useProductoService } from "../useProductoService";
import { Unidad } from "../../unidad/Unidad";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  maxWidth: "90%",
};

interface UnidadFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function PaqueteFormModal({ openArg, onClose, idToOpen }: UnidadFormModalProps) {
  const [id] = useState(idToOpen);
  const [open, setOpen] = useState(openArg);
  const [form, setForm] = useState<Producto>(new Producto());
  const UnidadService = useUnidadService();
  const ProductoService = useProductoService();
  const [mensajeDeError, setMensajeDeError] = useState<string>("");
  const [unidadesOptions, setUnidadesOptions] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      ProductoService.get(id).then((result) => setForm(result));
    } else {
      setForm(new Producto(0, "", 0, 0, 0));
    }
    UnidadService.getUnidades().then((result) => {
      setLoading(false);
      setUnidadesOptions(result);
    });
  }, [id]);

  const handleClose = (reason?: string) => {
    if (!reason || reason !== "backdropClick") {
      if (onClose) onClose();
      setOpen(false);
    }
  };

  const handleCloseClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    handleClose();
  };

  const handlerChangeNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm(
      (prevForm) =>
        new Producto(
          prevForm.id,
          value || "",
          prevForm.unidadId,
          prevForm.precio,
          prevForm.cantidad,
        ),
    );
  };

  const handlerChangeCantidad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm(
      (prevForm) =>
        new Producto(
          prevForm.id,
          prevForm.nombre,
          prevForm.unidadId,
          prevForm.precio,
          Number(value) || 0,
        ),
    );
  };

  const handleChangeUnidad = (event: SelectChangeEvent<number | string>) => {
    const { value } = event.target;
    setForm(
      (prevForm) =>
        new Producto(
          prevForm.id,
          prevForm.nombre,
          Number(value) || 0,
          prevForm.precio,
          prevForm.cantidad,
        ),
    );
  };

  const handlerChangePrecio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm(
      (prevForm) =>
        new Producto(
          prevForm.id,
          prevForm.nombre,
          prevForm.unidadId,
          Number(value) || 0,
          prevForm.cantidad,
        ),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombre) {
      setMensajeDeError("Ingrese un nombre.");
      return;
    }

    if (!form.precio) {
      setMensajeDeError("Ingrese un precio.");
      return;
    }

    if (!form.unidadId) {
      setMensajeDeError("Selecione una unidad.");
      return;
    }

    if (form.cantidad <= 0) {
      setMensajeDeError("Selecione una cantidad valida.");
      return;
    }

    if (id) {
      ProductoService.actualizar(id, form).then(() => handleClose());
    } else {
      ProductoService.crear(form).then(() => handleClose());
    }
  };

  return (
    <div>
      <Modal open={open} onClose={handleCloseClick}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Producto
            <IconButton
              aria-label="close"
              onClick={handleCloseClick}
              sx={{ position: "absolute", right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </Typography>
          {mensajeDeError && (
            <Alert severity="success" color="warning">
              {mensajeDeError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Id"
              name="id"
              value={form.id}
              margin="normal"
              disabled
              sx={{ width: { xs: "100%", md: "10%" } }}
            />
            <FormControl
              error={!form.nombre}
              sx={{
                width: { xs: "100%", md: "calc(100% - (10% + 16px))" },
                ml: { xs: 0, md: 2 },
              }}>
              <TextField
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handlerChangeNombre}
                margin="normal"
              />
              {!form.nombre && <FormHelperText>Por favor ingrese un Nombre.</FormHelperText>}
            </FormControl>
            <TextField
              label="Cantidad"
              name="cantidad"
              value={form.cantidad}
              onChange={handlerChangeCantidad}
              margin="normal"
              sx={{
                width: { xs: "100%", md: "calc(100% - (40% + 16px))" },
                mr: { xs: 0, md: 2 },
              }}
            />
            <FormControl
              error={!form.unidadId}
              sx={{ width: { xs: "100%", md: "40%" }, my: { xs: 0, md: 2 } }}>
              <InputLabel id="unidad-label">Unidad</InputLabel>
              <Select
                label="Unidad"
                labelId="unidad-label"
                id="unidad"
                value={form.unidadId}
                onChange={handleChangeUnidad}>
                <MenuItem value={"0"}>Vacio</MenuItem>
                {unidadesOptions.map((option: Unidad) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.nombre}
                  </MenuItem>
                ))}
              </Select>
              {!form.unidadId && <FormHelperText>Selecione una Unidad.</FormHelperText>}
            </FormControl>
            <TextField
              label="Precio"
              name="precio"
              value={form.precio}
              onChange={handlerChangePrecio}
              fullWidth
              margin="normal"
            />
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}>
              <Button type="submit" variant="contained" color="primary" sx={{ m: 1 }}>
                Enviar
              </Button>
              <Button variant="outlined" color="error" onClick={handleCloseClick} sx={{ m: 1 }}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      {loading && (
        <Modal open={true}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              width: "100vw",
            }}
          >
            <CircularProgress />
          </Box>
        </Modal>
      )}
    </div>
  );
}
