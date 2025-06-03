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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUnidadService } from "../../unidad/useUnidadService";
import Producto from "../Producto";
import Select from "@mui/material/Select";
import { MenuItem } from "@mui/material";
import { useProductoService } from "../useProductoService";
import { Unidad } from "../../unidad/Unidad";
import LoadingModel from "../../core/components/LoadingModel";
import { showConfirmDialog } from "../../core/components/ConfirmDialog";
import { Controller, useForm } from "react-hook-form";

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

interface ProductoFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function ProductoFormModal({ openArg, onClose, idToOpen }: ProductoFormModalProps) {
  const UnidadService = useUnidadService();
  const ProductoService = useProductoService();
  const [mensajeDeError, setMensajeDeError] = useState<string>("");
  const [unidadesOptions, setUnidadesOptions] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<Producto>({
    defaultValues: {
      id: 0,
      nombre: "",
      unidadId: 0,
      precio: 0,
      cantidad: 0,
    },
  });

  useEffect(() => {
    setLoading(true);
    if (idToOpen) {
      ProductoService.get(idToOpen).then((result) => {
        reset(result);
      });
    } else {
      reset({
        id: 0,
        nombre: "",
        unidadId: 0,
        precio: 0,
        cantidad: 0,
      });
    }
    UnidadService.getUnidades()
      .then((result) => {
        setLoading(false);
        setUnidadesOptions(result);
      })
      .catch(() => {
        setLoading(false);
        setMensajeDeError("Error al obtener unidades.");
      });
  }, [idToOpen, reset]);

  const handleClose = (reason?: string) => {
    if (!reason || reason !== "backdropClick") {
      if (onClose) onClose();
    }
  };

  const handleCloseClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    if (isDirty) {
      showConfirmDialog({
        question: "Tenés cambios sin guardar. ¿Estás seguro de que querés salir?",
        onYes: () => handleClose(),
        onNo: () => {},
      });
    } else {
      handleClose();
    }
  };

  const onSubmit = (data: Producto) => {
    if (idToOpen) {
      ProductoService.actualizar(idToOpen, data)
        .then(() => handleClose())
        .catch(() => setMensajeDeError("Error al actualizar el Producto."));
    } else {
      ProductoService.crear(data)
        .then(() => handleClose())
        .catch(() => setMensajeDeError("Error al crear un producto."));
    }
  };

  return (
    <div>
      <Modal open={openArg} onClose={handleCloseClick}>
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
            <Alert severity="error" color="warning">
              {mensajeDeError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Id"
              {...register("id")}
              margin="normal"
              disabled
              sx={{ width: { xs: "100%", md: "10%" } }}
            />
            <Controller
              name="nombre"
              control={control}
              rules={{
                required: "Por favor ingrese un Nombre.",
                minLength: { value: 2, message: "Debe tener al menos 2 caracteres." },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  margin="normal"
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  sx={{
                    width: { xs: "100%", md: "calc(100% - (10% + 16px))" },
                    ml: { xs: 0, md: 2 },
                  }}
                />
              )}
            />
            <Controller
              name="cantidad"
              control={control}
              rules={{
                required: "Ingrese una cantidad.",
                min: { value: 1, message: "Debe ser mayor a 0." },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cantidad"
                  type="number"
                  margin="normal"
                  error={!!errors.cantidad}
                  helperText={errors.cantidad?.message}
                  sx={{
                    width: { xs: "100%", md: "calc(100% - (40% + 16px))" },
                    mr: { xs: 0, md: 2 },
                  }}
                />
              )}
            />
            <FormControl
              error={!!errors.unidadId}
              sx={{ width: { xs: "100%", md: "40%" }, my: { xs: 0, md: 2 } }}>
              <InputLabel id="unidad-label">Unidad</InputLabel>
              <Controller
                name="unidadId"
                control={control}
                rules={{
                  validate: (value) => (value && value !== 0 ? true : "Seleccione una unidad."),
                }}
                render={({ field }) => (
                  <Select {...field} label="Unidad" labelId="unidad-label" id="unidad">
                    <MenuItem value={0}>Vacio</MenuItem>
                    {unidadesOptions.map((option: Unidad) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.unidadId && <FormHelperText>{errors.unidadId.message}</FormHelperText>}
            </FormControl>
            <Controller
              name="precio"
              control={control}
              rules={{
                required: "Ingrese un precio.",
                min: { value: 0.01, message: "Debe ser mayor a 0." },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Precio"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.precio}
                  helperText={errors.precio?.message}
                />
              )}
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
      {loading && <LoadingModel />}
    </div>
  );
}
