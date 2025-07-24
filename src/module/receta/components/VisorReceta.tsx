import { useEffect, useState } from "react";
import { Modal, Box, Typography, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Receta from "../Receta";
import { useRecetaService } from "../useRecetaService";
import { useProductoService } from "../../producto/useProductoService";
import { useUnidadService } from "../../unidad/useUnidadService";
import Producto from "../../producto/Producto";
import { Unidad } from "../../unidad/Unidad";
import LoadingModel from "../../core/components/LoadingModel";
import { useForm } from "react-hook-form";

import { modalStyle, headerBoxStyle } from "./recetaFormModalStyles";
import VisorIngredientesTable from "./VisorIngredientesTable";

interface VisorReceta {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

export default function VisorReceta({ openArg, onClose, idToOpen }: VisorReceta) {
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

  const { reset, watch } = useForm<Receta>({
    defaultValues: {
      id: 0,
      nombre: "",
      rinde: 0,
      ingredientes: [],
      observaciones: "",
      precio: 0,
      precio_unidad: 0,
    },
  });

  const nombre = watch("nombre");
  const rinde = watch("rinde");
  const ingredientes = watch("ingredientes");
  const observaciones = watch("observaciones");
  const precio = watch("precio");
  const precio_unidad = watch("precio_unidad");

  useEffect(() => {
    const cargarProductosYUnidades = async () => {
      setLoadingProducts(true);
      try {
        const productosResponse = await ProductoService.getAll();
        setProductos(productosResponse);
        const unidadesResponse = await UnidadService.getUnidades();
        setUnidades(unidadesResponse);
      } catch (error) {
        setMensajeDeError("Error al cargar los productos/unidades:");
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
            precio: result.precio ?? 0,
            precio_unidad: result.precio_unidad ?? 0,
          });
        } catch (error) {
          console.error("Error fetching receta:", error);
        } finally {
          setLoading(false);
        }
      } else if (!idToOpen) {
        setLoading(false);
        setId(0);
        reset({
          id: 0,
          nombre: "",
          rinde: 0,
          ingredientes: [],
          observaciones: "",
          precio: 0,
          precio_unidad: 0,
        });
      }
    };
    fetchData();
  }, [idToOpen, productos, unidades]);

  const handleCloseClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    handleClose("");
  };

  const handleClose = (reason?: string) => {
    if (!reason || reason !== "backdropClick") {
      if (onClose) onClose();
      setOpen(false);
    }
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleCloseClick}
        aria-labelledby="receta-modal-title"
        role="dialog">
        <Box sx={modalStyle}>
          <Box sx={headerBoxStyle}>
            <Typography id="receta-modal-title" variant="h6" component="h2">
              Receta: {nombre || <em>(Sin nombre)</em>}
              <IconButton
                aria-label="close"
                onClick={handleCloseClick}
                sx={{ position: "absolute", right: 8, top: 8 }}>
                <CloseIcon />
              </IconButton>
            </Typography>
          </Box>
          {mensajeDeError && (
            <Alert severity="error" color="error">
              {mensajeDeError}
            </Alert>
          )}

          <Box sx={{ width: "100%", ml: 2, mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Rinde:
            </Typography>
            <Box sx={{ width: "100%", pl: 5 }}>{rinde || 0} Porciones</Box>
          </Box>
          <Box sx={{ width: "100%", ml: 2, mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Ingredientes:
            </Typography>
            <VisorIngredientesTable
              ingredientes={ingredientes}
              rinde={rinde}
              precio={precio}
              precio_unidad={precio_unidad}
              unidades={unidades}
              productos={productos}
            />
          </Box>
          <Box sx={{ width: "100%", ml: 2, mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Observaciones/Pasos:
            </Typography>
            <Box sx={{ whiteSpace: "pre-wrap", width: "100%", pl: 5 }}>
              {observaciones?.trim() ? observaciones : "(Sin observaciones)"}
            </Box>
          </Box>
        </Box>
      </Modal>
      {(loading || loadingProducts) && <LoadingModel />}
    </div>
  );
}
