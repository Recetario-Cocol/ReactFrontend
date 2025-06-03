import { useEffect, useState } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUnidadService } from "../useUnidadService";
import { Unidad } from "../Unidad";
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

interface UnidadFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function UnidadFormModal({ openArg, onClose, idToOpen }: UnidadFormModalProps) {
  const [mensajeDeError, setMensajeDeError] = useState<string>("");
  const UnidadService = useUnidadService();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty, errors },
  } = useForm<Unidad>({
    defaultValues: {
      id: 0,
      nombre: "",
      abreviacion: "",
      can_be_deleted: false,
    },
  });

  useEffect(() => {
    if (idToOpen) {
      UnidadService.getUnidad(idToOpen).then((unidad: Unidad) => {
        reset({
          id: unidad.id,
          nombre: unidad.nombre,
          abreviacion: unidad.abreviacion,
          can_be_deleted: unidad.can_be_deleted,
        });
        console.log("Unidad cargada:", unidad);
      });
    } else {
      reset();
    }
  }, [idToOpen, UnidadService, reset]);

  const handleClose = (reason?: string) => {
    if (!reason || reason !== "backdropClick") {
      if (onClose) onClose();
    }
  };

  const handleCloseEvent = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    if (isDirty) {
      showConfirmDialog({
        question: "Tenés cambios sin guardar. ¿Estás seguro de que querés salir?",
        onYes: () => handleClose(""),
        onNo: () => {},
      });
    } else {
      handleClose("");
    }
  };

  const onSubmit = (data: Unidad) => {
    if (idToOpen !== 0) {
      UnidadService.actualizarUnidad(idToOpen, data)
        .then(() => handleClose())
        .catch(() => setMensajeDeError("Error al tratar de actualizar la unidad"));
    } else {
      UnidadService.crearUnidad(data)
        .then(() => handleClose())
        .catch(() => setMensajeDeError("Error al tratar de crear la unidad"));
    }
  };

  return (
    <Modal open={openArg} onClose={handleCloseEvent}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Unidad
          <IconButton
            aria-label="close"
            onClick={handleCloseEvent}
            sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </Typography>
        {mensajeDeError && (
          <Alert color="warning" severity="error">
            {mensajeDeError}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Id" fullWidth margin="normal" disabled {...register("id")} />
          <Controller
            name="nombre"
            control={control}
            rules={{
              required: "Ingrese un Nombre.",
              minLength: {
                value: 2,
                message: "Debe tener al menos 2 caracteres.",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                margin="normal"
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
            )}
          />
          <Controller
            name="abreviacion"
            control={control}
            rules={{
              required: "Ingrese una abreviacion",
              maxLength: {
                value: 5,
                message: "Máximo 5 caracteres.",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Abreviación"
                fullWidth
                margin="normal"
                error={!!errors.abreviacion}
                helperText={errors.abreviacion?.message}
              />
            )}
          />
          <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" color="primary" sx={{ m: 1 }}>
              Enviar
            </Button>
            <Button variant="outlined" color="error" onClick={handleCloseEvent} sx={{ m: 1 }}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
