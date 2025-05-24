import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUserService } from "../useUserService";
import { Usuario } from "../Usuario";
import PermisosAutoComplete from "./PermisososAutoComplete";
import RolesAutoComplete from "./RolesAutoComplete";
import { useForm } from "react-hook-form";

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

interface UserFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function UserFormModal({ openArg, onClose, idToOpen }: UserFormModalProps) {
  const [id, setId] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(openArg);
  const [form, setForm] = useState<Usuario>(new Usuario());
  const {
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm();

  const [mensajeDeError, setMensajeDeError] = useState<string>("");
  const userService = useUserService();

  useEffect(() => {
    if (idToOpen) {
      setId(idToOpen);
      userService.getUsuario(idToOpen).then((result) => {
        setForm(result);
      });
    } else {
      setForm(new Usuario(0, "", ""));
    }
  }, [idToOpen]);

  const handleClose = (reason?: string) => {
    if (!reason || reason !== "backdropClick") {
      if (onClose) onClose();
      setOpen(false);
    }
  };

  const handleCloseClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    handleClose();
  };

  const onSubmit = () => {
    if (!form.name) {
      setMensajeDeError("Ingrese un nombre.");
      return;
    }

    if (!form.email) {
      setMensajeDeError("Ingrese un email.");
      return;
    }

    if (id) {
      userService.actualizarUsuario(id, form).then(() => handleClose());
    } else {
      userService.crearUsuario(form).then(() => handleClose());
    }
    clearErrors("permisos");
    clearErrors("roles");
  };

  return (
    <Modal open={open} onClose={handleCloseClick}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          User
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
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Id" name="id" value={form.id} fullWidth margin="dense" disabled />
          <TextField
            label="Nombre"
            name="nombre"
            value={form.name}
            fullWidth
            margin="dense"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm(
                (prevForm) =>
                  new Usuario(
                    prevForm.id,
                    e.target.value || "",
                    prevForm.email,
                    prevForm.createdAt,
                    prevForm.updatedAt,
                    prevForm.permisosIds,
                    prevForm.roles,
                  ),
              )
            }
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            fullWidth
            margin="dense"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm(
                (prevForm) =>
                  new Usuario(
                    prevForm.id,
                    prevForm.name,
                    e.target.value || "",
                    prevForm.createdAt,
                    prevForm.updatedAt,
                    prevForm.permisosIds,
                    prevForm.roles,
                  ),
              )
            }
          />
          <PermisosAutoComplete
            value={form.permisosIds}
            onChange={(newValue) => {
              setForm(
                (prevForm) =>
                  new Usuario(
                    prevForm.id,
                    prevForm.name,
                    prevForm.email,
                    prevForm.createdAt,
                    prevForm.updatedAt,
                    newValue.map((permiso) => permiso.id),
                    prevForm.roles,
                  ),
              );
            }}
            error={
              typeof errors.permisos?.message === "string" ? errors.permisos.message : undefined
            }
          />
          <RolesAutoComplete
            value={form.roles}
            onChange={() => {}}
            error={typeof errors.roles?.message === "string" ? errors.roles.message : undefined}
          />
          <Typography variant="overline" gutterBottom sx={{ display: "block" }}>
            Creado: {form.createdAt.toLocaleString()}
          </Typography>
          <Typography variant="overline" gutterBottom sx={{ display: "block" }}>
            Actualizado: {form.updatedAt.toLocaleString()}
          </Typography>
          <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
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
  );
}
