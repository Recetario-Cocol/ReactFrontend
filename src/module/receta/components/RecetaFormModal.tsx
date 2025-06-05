import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Receta from "../Receta";
import { useRecetaService } from "../useRecetaService";
import { useProductoService } from "../../producto/useProductoService";
import { useUnidadService } from "../../unidad/useUnidadService";
import Producto from "../../producto/Producto";
import { Unidad } from "../../unidad/Unidad";
import Ingrediente from "../../ingrediente/Ingrediente";
import GrillaIngredientes, {
  GrillaIngredientesRow,
} from "../../ingrediente/components/GrillaIngredientes";
import LoadingModel from "../../core/components/LoadingModel";
import { Controller, useForm } from "react-hook-form";

import {
  modalStyle,
  headerBoxStyle,
  nombreTextFieldStyle,
  rindeTextFieldStyle,
  mainBoxStyle,
  ingredientesObservacionesBoxStyle,
  grillaIngredientesBoxStyle,
  observacionesBoxStyle,
  observacionesLabelStyle,
  observacionesTextFieldStyle,
  footerBoxStyle,
  buttonStyle,
} from "./recetaFormModalStyles";
import { showConfirmDialog } from "../../core/components/ConfirmDialog";

interface UnidadFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function RecetaFormModal({ openArg, onClose, idToOpen }: UnidadFormModalProps) {
  const [id, setId] = useState<number>(0);
  const [open, setOpen] = useState(openArg);
  const RecetaService = useRecetaService();
  const ProductoService = useProductoService();
  const UnidadService = useUnidadService();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [mensajeDeError, setMensajeDeError] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue, // <-- agrega setValue aquí
  } = useForm<Receta>({
    defaultValues: {
      id: 0,
      nombre: "",
      rinde: 0,
      ingredientes: [],
      observaciones: "",
    },
  });

  // Watch rinde for GrillaIngredientes
  const rindeValue = watch("rinde");

  useEffect(() => {
    const cargarProductosYUnidades = async () => {
      setLoadingProducts(true);
      try {
        const productosResponse = await ProductoService.getAll();
        setProductos(productosResponse);
        const unidadesResponse = await UnidadService.getUnidades();
        setUnidades(unidadesResponse);
      } catch (error) {
        console.error("Error al cargar los productos/unidades:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    cargarProductosYUnidades();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (idToOpen && productos.length > 0 && unidades.length > 0 && idToOpen !== id) {
        try {
          setId(idToOpen);
          const result: Receta = await RecetaService.get(idToOpen);
          reset({
            id: result.id ?? 0,
            nombre: result.nombre ?? "",
            rinde: result.rinde ?? 0,
            ingredientes: Array.isArray(result.ingredientes) ? result.ingredientes : [],
            observaciones: result.observaciones ?? "",
          });
        } catch (error) {
          console.error("Error fetching receta:", error);
        } finally {
          setLoading(false);
        }
      } else if (!idToOpen) {
        setLoading(false);
        setId(0); // <-- Ensure id is reset to 0 for new recipe
        reset({
          id: 0,
          nombre: "",
          rinde: 0,
          ingredientes: [],
          observaciones: "",
        });
      }
    };
    fetchData();
  }, [idToOpen, productos, unidades, reset]); // Dependencias correctas

  const handleClose = (reason?: string) => {
    if (!reason || reason !== "backdropClick") {
      if (onClose) onClose();
      setOpen(false);
    }
  };

  const handleCloseClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
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

  const onSubmit = (data: Receta) => {
    const recetaToSend = new Receta(
      data.id,
      data.nombre,
      data.rinde,
      data.ingredientes.map(
        (i) =>
          new Ingrediente(
            id ? i.id : 0, // Use 0 for new ingredientes when creating
            i.productoId,
            i.unidadId,
            i.cantidad,
          ),
      ),
      data.observaciones,
    );

    if (id) {
      RecetaService.actualizar(id, recetaToSend)
        .then(() => handleClose())
        .catch(() => setMensajeDeError("Error al actualizar la receta."));
    } else {
      RecetaService.crear(recetaToSend)
        .then(() => handleClose())
        .catch(() => setMensajeDeError("Error al crear la receta."));
    }
  };

  function ingredienteToRow(ingrediente: Ingrediente): GrillaIngredientesRow {
    const producto = productos.find((row) => row.id === ingrediente.productoId);
    const unidad = unidades.find((row) => row.id === producto?.unidadId);
    const precio = ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;
    return new GrillaIngredientesRow(
      ingrediente.id,
      ingrediente.cantidad.toString() + (unidad ? " " + unidad?.abreviacion : ""),
      ingrediente.productoId,
      ingrediente.unidadId,
      precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      }),
    );
  }

  function rowToIngrediente(row: GrillaIngredientesRow): Ingrediente {
    let cantidad = 0;
    if (typeof row.cantidad === "string") {
      cantidad = parseFloat(row.cantidad.split(" ")[0]) || 0;
    } else if (typeof row.cantidad === "number") {
      cantidad = row.cantidad;
    }
    return new Ingrediente(row.id, row.productoId, row.unidadId, cantidad);
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleCloseClick}
        aria-labelledby="receta-modal-title"
        role="dialog">
        <>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={modalStyle}>
            <Box sx={headerBoxStyle}>
              <Typography id="receta-modal-title" variant="h6" component="h2">
                Receta
                <IconButton
                  aria-label="close"
                  onClick={handleCloseClick}
                  sx={{ position: "absolute", right: 8, top: 8 }}>
                  <CloseIcon />
                </IconButton>
              </Typography>
            </Box>
            <Box sx={mainBoxStyle}>
              {mensajeDeError && (
                <Alert severity="error" color="error">
                  {mensajeDeError}
                </Alert>
              )}
              <Box sx={{ width: "100%" }}>
                <Controller
                  name="nombre"
                  control={control}
                  rules={{
                    required: "Ingrese un nombre.",
                    minLength: { value: 2, message: "Debe tener al menos 2 caracteres." },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre"
                      margin="normal"
                      error={!!errors.nombre}
                      helperText={errors.nombre?.message}
                      sx={nombreTextFieldStyle}
                    />
                  )}
                />
                <Controller
                  name="rinde"
                  control={control}
                  rules={{
                    required: "Ingrese cuantas porciones rinde la receta.",
                    min: { value: 1, message: "Ingrese cuantas porciones rinde la receta." },
                  }}
                  render={({ field }) => (
                    <Tooltip title="Cuantas Porciones rinde la receta">
                      <TextField
                        {...field}
                        label="Rinde:"
                        type="number"
                        fullWidth
                        margin="normal"
                        error={!!errors.rinde}
                        helperText={errors.rinde?.message}
                        sx={rindeTextFieldStyle}
                      />
                    </Tooltip>
                  )}
                />
              </Box>
              <Box sx={ingredientesObservacionesBoxStyle}>
                <Box sx={grillaIngredientesBoxStyle} id="grillaIngredientes">
                  <Controller
                    name="ingredientes"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value && value.length > 0 ? true : "Ingrese al menos un ingrediente",
                    }}
                    render={({ field }) => (
                      <GrillaIngredientes
                        value={field.value.map((i: Ingrediente) => ingredienteToRow(i))}
                        rindeFromReceta={rindeValue}
                        productosFromReceta={productos}
                        unidadesFromReceta={unidades}
                        onChange={(rows) => {
                          const ingredientes = rows.map(rowToIngrediente);
                          field.onChange(ingredientes);
                          setValue("ingredientes", ingredientes, { shouldValidate: true }); // <-- fuerza la actualización y validación
                        }}
                      />
                    )}
                  />
                  {errors.ingredientes && (
                    <Alert severity="warning">{errors.ingredientes.message}</Alert>
                  )}
                </Box>
                <Box sx={observacionesBoxStyle} id="BoxObservaciones">
                  <Typography variant="body1" sx={observacionesLabelStyle}>
                    Observaciones/Receta:
                  </Typography>
                  <Controller
                    name="observaciones"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        label="Observaciones"
                        multiline
                        minRows={5}
                        fullWidth
                        margin="normal"
                        sx={observacionesTextFieldStyle}
                        inputProps={{ "data-testid": "observaciones-input" }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={footerBoxStyle}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={buttonStyle}
                aria-label="Enviar"
                data-testid="enviar-btn">
                Enviar
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCloseClick}
                sx={buttonStyle}
                aria-label="Cancelar"
                data-testid="cancelar-btn">
                Cancelar
              </Button>
            </Box>
          </Box>
        </>
      </Modal>
      {(loading || loadingProducts) && <LoadingModel />}
    </div>
  );
}
