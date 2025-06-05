import { Fragment, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm, useWatch } from "react-hook-form";
import Ingrediente from "../Ingrediente";
import Producto from "../../producto/Producto";
import { Unidad } from "../../unidad/Unidad";

const generateUniqueNumericId = () => -1 * (Date.now() + Math.floor(Math.random() * 1000));

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 1,
  maxWidth: "90%",
};

interface IngredienteModalProps {
  openArg: boolean;
  onSubmit: (ingrediente?: Ingrediente) => void;
  ingredienteParam?: Ingrediente;
  unidadesParam: Unidad[];
  productosParam: Producto[];
  onClose: () => void;
}

export default function IngredienteModal({
  openArg,
  onSubmit,
  ingredienteParam,
  unidadesParam,
  productosParam,
  onClose,
}: IngredienteModalProps) {
  const [abreviacion, setAbreviacion] = useState("");
  const [precio, setPrecio] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Ingrediente>({
    defaultValues: new Ingrediente(
      ingredienteParam?.id ?? generateUniqueNumericId(),
      ingredienteParam?.productoId ?? 0,
      ingredienteParam?.unidadId ?? 0,
      ingredienteParam?.cantidad ?? 0,
    ),
  });

  // Observa los cambios de productoId en tiempo real
  const productoId = useWatch({ control, name: "productoId" });

  useEffect(() => {
    if (ingredienteParam) {
      reset(
        new Ingrediente(
          ingredienteParam.id,
          ingredienteParam.productoId,
          ingredienteParam.unidadId,
          ingredienteParam.cantidad,
        ),
      );
    } else {
      reset(new Ingrediente(generateUniqueNumericId()));
    }
  }, [ingredienteParam, reset]);

  // Actualiza abreviación y precio cuando cambia el producto
  useEffect(() => {
    const prod = productosParam.find((p) => p.id === productoId);
    if (prod) {
      const unidad = unidadesParam.find((u) => u.id === prod.unidadId);
      setValue("unidadId", unidad?.id ?? 0);
      setAbreviacion(unidad?.abreviacion ?? "");
      setPrecio(prod.precio ?? 0);
    } else {
      setAbreviacion("");
      setPrecio(0);
      setValue("unidadId", 0);
    }
  }, [productoId, productosParam, unidadesParam, setValue]);

  const handleFormSubmit = (data: Ingrediente) => {
    onSubmit(data);
    onClose();
  };

  const handleCancel = () => {
    if (isDirty) {
      if (confirm("Tenés cambios sin guardar. ¿Salir de todos modos?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={openArg}
      onClose={handleCancel}
      aria-labelledby="ingrediente-modal-title"
      role="dialog">
      <Box sx={style}>
        <Typography id="ingrediente-modal-title" variant="h6">
          Ingrediente
          <IconButton onClick={handleCancel} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </Typography>
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmit(handleFormSubmit)(e);
          }}>
          <Controller
            name="productoId"
            control={control}
            rules={{
              required: "Debe seleccionar un producto.",
              validate: (value) => value !== 0 || "Debe seleccionar un producto válido.",
            }}
            render={({ field }) => {
              const selectId = "producto-select";
              const labelId = "producto-label";
              return (
                <FormControl fullWidth margin="normal">
                  <InputLabel id={labelId}>Producto</InputLabel>
                  <Select
                    {...field}
                    labelId={labelId}
                    id={selectId}
                    label="Producto"
                    error={!!errors.productoId}>
                    <MenuItem value={0}>Seleccione un Producto</MenuItem>
                    {productosParam.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.productoId && (
                    <Typography variant="caption" color="error">
                      {errors.productoId.message}
                    </Typography>
                  )}
                </FormControl>
              );
            }}
          />

          <Controller
            name="cantidad"
            control={control}
            rules={{
              required: "Ingrese una cantidad válida.",
              min: {
                value: 0.0001,
                message: "Ingrese una cantidad válida mayor a 0.",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cantidad"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.cantidad}
                helperText={errors.cantidad?.message}
              />
            )}
          />

          <TextField label="Unidad" value={abreviacion} fullWidth margin="normal" disabled />
          <TextField label="Precio" value={precio} fullWidth margin="normal" disabled />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" type="submit" sx={{ mr: 1 }}>
              Guardar
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}

type AlertDialogBorrarIngredienteProps = {
  paramId: number;
  onSubmit: (id: number) => void;
  onClose: () => void;
};

export function AlertDialogBorrarIngrediente({
  paramId,
  onSubmit,
  onClose,
}: AlertDialogBorrarIngredienteProps): React.JSX.Element {
  const [open, setOpen] = useState(true);
  const handlerClickSi = () => {
    onSubmit(paramId);
    handleClose();
  };
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  return (
    <Fragment>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">{"¿Desea Borrar el Ingrediente?"}</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            No
          </Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
