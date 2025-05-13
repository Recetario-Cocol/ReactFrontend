import { useEffect, useState } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUnidadService } from "../useUnidadService";
import { Unidad } from "../Unidad";

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
  const [id] = useState<number>(idToOpen);
  const [open, setOpen] = useState<boolean>(openArg);
  const [form, setForm] = useState<Unidad>(new Unidad());
  const [mensajeDeError, setMensajeDeError] = useState<string>("");
  const UnidadService = useUnidadService();

  useEffect(() => {
    if (id) {
      UnidadService.getUnidad(id).then((result: Unidad) => setForm(result));
    } else {
      setForm(new Unidad(0, "", ""));
    }
  }, [id]);

  const handleClose = (reason?: string) => {
    if (!reason || reason !== "backdropClick") {
      if (onClose) onClose();
      setOpen(false);
    }
  };

  const handleCloseEvent = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    handleClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.nombre) {
      setMensajeDeError("Ingrese un nombre.");
      return;
    }

    if (!form.abreviacion) {
      setMensajeDeError("Ingrese una abreviacion");
      return;
    }

    if (id) {
      UnidadService.actualizarUnidad(id, form).then(() => handleClose());
    } else {
      UnidadService.crearUnidad(form).then(() => handleClose());
    }
  };

  return (
    <Modal open={open} onClose={handleCloseEvent}>
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
          <Alert severity="success" color="warning">
            {mensajeDeError}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Id" name="id" value={form.id} fullWidth margin="normal" disabled />
          <TextField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            fullWidth
            margin="normal"
            onChange={(e) =>
              setForm(
                (prevForm) => new Unidad(prevForm.id, e.target.value || "", prevForm.abreviacion),
              )
            }
          />
          <TextField
            label="Abreviación"
            name="abreviacion"
            value={form.abreviacion}
            fullWidth
            margin="normal"
            onChange={(e) =>
              setForm((prevForm) => new Unidad(prevForm.id, prevForm.nombre, e.target.value || ""))
            }
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
