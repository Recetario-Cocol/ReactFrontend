import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Alert} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useUserService } from '../useUserService';
import { Usuario } from '../Usuario';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import PermisososAutoComplete from './PermisososAutoComplete';
import RolesAutoComplete from './RolesAutoComplete';
import { useForm } from 'react-hook-form';
import { createPermisosArray, createRolesArray, usePermisos } from '../../contexts/Permisos';

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
  maxWidth: '90%'
};

interface UserFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function UserFormModal({openArg, onClose, idToOpen}: UserFormModalProps) {
  const [id,] = useState<number>(idToOpen);
  const [open, setOpen] = useState<boolean>(openArg);
  const [form, setForm] = useState<Usuario>(new Usuario());
  const { handleSubmit, setError, clearErrors, formState: { errors } } = useForm();

  const [mensajeDeError, setMensajeDeError] = useState<String>("");
  const userService = useUserService();
  const permisosContext = usePermisos();

  
  useEffect(() => {
    if (id) {
      userService.getUsuario(id).then((result) => {
        const item =  result.data;
        const userFromApi = new Usuario(
          item.id,
          item.fullName,
          item.email,
          new Date(item.createdAt),
          new Date(item.updatedAt),
          createPermisosArray(item.permissions, permisosContext),
          createRolesArray(item.roles)
        );
        console.log("item", userFromApi);
        setForm(userFromApi);
      });  
    } else {
      setForm(new Usuario(0, '', ''));
    }
  }, [id]);
  
  const handleClose = (event?: any, reason?: string) => {
    if (!reason || reason !== 'backdropClick') {
      if(onClose) onClose();
      setOpen(false);
    }
  }

  const onSubmit = () => {
    console.log("form", form.toJSON());
    
    if (false && form.permisos.length === 0) {
      setError("permisos", { message: "Debes seleccionar al menos un Permiso" });
      return;
    }

    if (form.roles.length === 0) {
      setError("roles", { message: "Debes seleccionar al menos un Rol}" });
      return;
    }
    if(!form.fullName) {
      setMensajeDeError("Ingrese un nombre.");
      return;
    }

    if (!form.email) {
      setMensajeDeError("Ingrese un email.");
      return;
    }
  
    if (id) {
      userService.actualizarUsuario(id, form).then(
        ()=>handleClose()
      );
    } else {
      userService.crearUsuario(form).then(
        ()=>handleClose()
      );
    }
    clearErrors("permisos");
    clearErrors("roles");
  };
    
  return <Modal open={open} onClose={handleClose}>
    <Box sx={style}>
      <Typography variant="h6" component="h2">
        User
        <IconButton aria-label="close" onClick={handleClose} sx={{position: 'absolute', right: 8, top: 8}}>
          <CloseIcon />
        </IconButton>
      </Typography>
      {mensajeDeError && <Alert severity="success" color="warning">{mensajeDeError}</Alert>}    
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Id" name="id" value={form.id} fullWidth margin="dense" disabled/>
        <TextField label="Nombre" name="nombre" value={form.fullName} fullWidth margin="dense"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(
            (prevForm) => new Usuario(
              prevForm.id,
              e.target.value || '',
              prevForm.email,
              prevForm.createdAt,
              prevForm.updatedAt,
              prevForm.permisos,
              prevForm.roles
            ))}
        />
        <TextField label="Email" name="email" value={form.email} fullWidth margin="dense"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(
            (prevForm) => new Usuario(
              prevForm.id,
              prevForm.fullName,
              e.target.value || '',
              prevForm.createdAt,
              prevForm.updatedAt,
              prevForm.permisos,
              prevForm.roles
            ))}
        />
        <PermisososAutoComplete
          value={form.permisos}
          onChange={(newValue) => {
            setForm((prevForm) => new Usuario(prevForm.id, prevForm.fullName, prevForm.email, prevForm.createdAt, prevForm.updatedAt, newValue, prevForm.roles));
          }}
          error={typeof errors.permisos?.message === "string" ? errors.permisos.message : undefined}
        />
        <RolesAutoComplete
          value={form.roles}
          onChange={(newValue) => {
            setForm((prevForm) => new Usuario(prevForm.id, prevForm.fullName, prevForm.email, prevForm.createdAt, prevForm.updatedAt, prevForm.permisos, newValue));
          }}
          error={typeof errors.roles?.message === "string" ? errors.roles.message : undefined}
         />
        <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>Creado: {form.createdAt.toLocaleString()}</Typography>
        <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>Actualizado: {form.updatedAt.toLocaleString()}</Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
          <Button type="submit" variant="contained" color="primary" sx={{m:1}}>Enviar</Button>
          <Button variant="outlined" color="error" onClick={handleClose} sx={{m:1}}>Cancelar</Button>
        </Box>
      </Box>
    </Box>
  </Modal>;
}

type AlertDialogBorrarUsuarioProps = {
  paramId: number;
  onClose?: (mensaje: string) => void;
  forced?: boolean;
};

export function AlertDialogBorrarUsuario({ paramId, onClose, forced }: AlertDialogBorrarUsuarioProps): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(true);
  const [confirmAgain, setConfirmAgain] = React.useState<boolean>(false);
  const [id] = React.useState<number>(paramId);
  const userService = useUserService();

  const handleFirstConfirmation = () => {
    if (forced) {
      setConfirmAgain(true);
      setOpen(false);
    } else {
      handleDelete();
    }
  };

  const handleDelete = async () => {
    try {
      await userService.eliminarUsuario(id, forced);
      handleClose("Usuario eliminado correctamente.");
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al intentar eliminar el Usuario.";
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response) {
        const { status } = axiosError.response;
        if (status === 409) {
          mensajeError = "No se puede eliminar el usuario porque está relacionado con otros recursos.";
        } else if (status === 404) {
          mensajeError = "El usuario que intentas eliminar no existe.";
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
    setConfirmAgain(false);
  };

  return (<>
    <Dialog open={open} onClose={() => handleClose("")} aria-labelledby="alert-dialog-title">
      <DialogTitle id="alert-dialog-title">{"¿Desea Borrar el Usuario?"}</DialogTitle>
      <DialogActions>
        <Button onClick={() => handleClose("")} autoFocus>No</Button>
        <Button onClick={handleFirstConfirmation}>Sí</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={confirmAgain} onClose={() => handleClose("")} aria-labelledby="alert-dialog-title">
      <DialogTitle id="alert-dialog-title">
        {"Esta acción es irreversible. ¿Seguro que desea borrar el Usuario y Todas las entidades de este usuario?"}
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => handleClose("")} autoFocus>No</Button>
        <Button onClick={handleDelete}>Sí, eliminar</Button>
      </DialogActions>
    </Dialog>
  </>);
}
