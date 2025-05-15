import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Receta from "../Receta";
import { useRecetaService } from "../useRecetaService";
import { useProductoService } from "../../producto/useProductoService";
import { useUnidadService } from "../../unidad/useUnidadService";
import Producto from "../../producto/Producto";
import { Unidad } from "../../unidad/Unidad";
import Ingrediente from "../../ingrediente/Ingrediente";
import IngredienteModal, {
  AlertDialogBorrarIngrediente,
} from "../../ingrediente/components/IngredienteModal";
import GrillaIngredientes, {
  GrillaIngredientesRow,
} from "../../ingrediente/components/GrillaIngredientes";
import LoadingModel from "../../core/components/LoadingModel";

// Importar los estilos extraídos
import {
  modalStyle,
  headerBoxStyle,
  idTextFieldStyle,
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

interface UnidadFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function RecetaFormModal({ openArg, onClose, idToOpen }: UnidadFormModalProps) {
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | undefined>(
    undefined,
  );
  const [id, setId] = useState<number>(0);
  const [open, setOpen] = useState(openArg);
  const [form, setForm] = useState<Receta>(new Receta());
  const [rows, setRows] = useState<GrillaIngredientesRow[]>([]);
  const RecetaService = useRecetaService();
  const ProductoService = useProductoService();
  const UnidadService = useUnidadService();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [openIngredienteModal, setOpenIngredienteModal] = useState(false);
  const onHanderSubmitIngrediente = (ingrediente: Ingrediente | undefined) => {
    if (ingrediente) addRowFromIngrediente(ingrediente);
  };
  const [openBorrarIngrediente, setOpenBorrarIngrediente] = useState(false);
  const handleCloseIngredienteModal = () => {
    setOpenIngredienteModal(false);
  };
  const [ingredienteIdToDelete, setIngredienteIdToDelete] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [mensajeDeError, setMensajeDeError] = useState<string>("");

  const addRowFromIngrediente = (ingrediente: Ingrediente) => {
    const producto = productos.find((row: Producto) => row.id === ingrediente.productoId);
    const precio = ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;
    const newRow: GrillaIngredientesRow = {
      id: ingrediente.id,
      productoId: ingrediente.productoId,
      unidadId: ingrediente.unidadId,
      cantidad: ingrediente.cantidad,
      precio: precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      }),
    };

    setRows((prevRows: GrillaIngredientesRow[]) => {
      const existingRowIndex = prevRows.findIndex(
        (row: GrillaIngredientesRow) => row.id === newRow.id,
      );
      if (existingRowIndex !== -1) {
        const updatedRows = [...prevRows];
        updatedRows[existingRowIndex] = newRow;
        return updatedRows;
      } else {
        return [...prevRows, newRow];
      }
    });
  };

  const handleIngredienteCloseDialogClose = () => {
    setOpenBorrarIngrediente(false);
  };

  const handleIngredienteCloseDialog = (id: number) => {
    setRows((prevRows: GrillaIngredientesRow[]) => {
      return prevRows.filter((row) => row.id !== id);
    });
  };

  const agregarIngrediente = () => {
    setIngredienteSeleccionado(undefined);
    setOpenIngredienteModal(true);
  };

  const modificarIngrediente = () => {
    setOpenIngredienteModal(true);
  };

  const eliminarIngrediente = () => {
    if (ingredienteSeleccionado?.id) {
      setIngredienteIdToDelete(ingredienteSeleccionado.id);
      setOpenBorrarIngrediente(true);
    }
  };

  const fetchData = async () => {
    if (idToOpen) {
      if (productos.length > 0 && idToOpen !== id && unidades.length > 0) {
        try {
          setId(idToOpen);
          const result: Receta = await RecetaService.get(idToOpen);
          setForm(result);
          const nuevasFilas = result.ingredientes.map((ingrediente: Ingrediente) => {
            const producto = productos.find((row: Producto) => row.id === ingrediente.productoId);
            const precio =
              ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;
            setLoading(false);
            return new GrillaIngredientesRow(
              ingrediente.id,
              ingrediente.cantidad,
              ingrediente.productoId,
              ingrediente.unidadId,
              precio.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              }),
            );
          });
          setRows(nuevasFilas);
        } catch (error) {
          console.error("Error fetching receta:", error);
        }
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [idToOpen, productos, unidades]);

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

  const handlerChangeNombre = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm(
      (prevForm: Receta) =>
        new Receta(
          prevForm.id,
          value || "",
          prevForm.rinde,
          prevForm.ingredientes,
          prevForm.observaciones,
        ),
    );
  };

  const handlerChangeRinde = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm(
      (prevForm: Receta) =>
        new Receta(
          prevForm.id,
          prevForm.nombre,
          Number(value) || 0,
          prevForm.ingredientes,
          prevForm.observaciones,
        ),
    );
  };

  const handlerChangeObservaciones = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm(
      (prevForm: Receta) =>
        new Receta(
          prevForm.id,
          prevForm.nombre,
          prevForm.rinde,
          prevForm.ingredientes,
          value || "",
        ),
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.ingredientes = rows.map((row: GrillaIngredientesRow) => {
      let cantidad = 0;
      if (typeof row.cantidad === "string") {
        const cantidadString: string = row.cantidad;
        cantidad = parseFloat(cantidadString.split(" ")[0]) || 0;
      } else if (typeof row.cantidad === "number") {
        cantidad = row.cantidad;
      }
      return new Ingrediente(row.id, row.productoId, row.unidadId, cantidad);
    });

    if (!form.nombre) {
      setMensajeDeError("Ingrese un nombre.");
      return;
    }

    if (!form.rinde) {
      setMensajeDeError("Ingrese cuantas rinde la receta.");
      return;
    }

    if (form.ingredientes.length < 1) {
      setMensajeDeError("Ingrese al menos un ingrediente");
      return;
    }

    if (id) {
      RecetaService.actualizar(id, form).then(() => handleClose());
    } else {
      RecetaService.crear(form).then(() => handleClose());
    }
  };

  return (
    <div>
      <Modal open={open} onClose={handleCloseClick}>
        <>
          <Box component="form" onSubmit={handleSubmit} sx={modalStyle}>
            <Box sx={headerBoxStyle}>
              <Typography variant="h6" component="h2">
                Receta
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
            </Box>
            <Box sx={mainBoxStyle}>
              <Box sx={{ width: "100%" }}>
                <TextField
                  label="ID"
                  name="id"
                  value={form.id}
                  margin="normal"
                  disabled
                  sx={idTextFieldStyle}
                />
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handlerChangeNombre}
                  margin="normal"
                  sx={nombreTextFieldStyle}
                />
                <TextField
                  label="Rinde Cuantas porciones"
                  name="rinde"
                  value={form.rinde}
                  onChange={handlerChangeRinde}
                  fullWidth
                  margin="normal"
                  sx={rindeTextFieldStyle}
                />
              </Box>
              <Box sx={ingredientesObservacionesBoxStyle}>
                <Box sx={grillaIngredientesBoxStyle} id="grillaIngredientes">
                  <GrillaIngredientes
                    onIngredienteAdded={agregarIngrediente}
                    onIngredienteEdited={modificarIngrediente}
                    onIngredienteDeleted={eliminarIngrediente}
                    onIngredienteSelecionado={setIngredienteSeleccionado}
                    rowsFromReceta={rows}
                    rindeFromReceta={form.rinde}
                    productosFromReceta={productos}
                  />
                </Box>
                <Box sx={observacionesBoxStyle} id="BoxObservaciones">
                  <Typography variant="body1" sx={observacionesLabelStyle}>
                    Observaciones/Receta:
                  </Typography>
                  <TextField
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handlerChangeObservaciones}
                    variant="outlined"
                    label="Observaciones"
                    multiline
                    fullWidth
                    margin="normal"
                    sx={observacionesTextFieldStyle}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={footerBoxStyle}>
              <Button type="submit" variant="contained" color="primary" sx={buttonStyle}>
                Enviar
              </Button>
              <Button variant="outlined" color="error" onClick={handleCloseClick} sx={buttonStyle}>
                Cancelar
              </Button>
            </Box>
          </Box>
          <Box>
            {!loadingProducts && openIngredienteModal && (
              <IngredienteModal
                openArg={openIngredienteModal}
                onSubmit={onHanderSubmitIngrediente}
                ingredienteParam={ingredienteSeleccionado}
                unidades={unidades}
                productos={productos}
                onClose={handleCloseIngredienteModal}
              />
            )}
            {!loadingProducts && openBorrarIngrediente && (
              <AlertDialogBorrarIngrediente
                paramId={ingredienteIdToDelete}
                onSubmit={handleIngredienteCloseDialog}
                onClose={handleIngredienteCloseDialogClose}
              />
            )}
          </Box>
        </>
      </Modal>
      {(loading || loadingProducts) && <LoadingModel />}
    </div>
  );
}
