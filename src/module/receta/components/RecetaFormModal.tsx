import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton, Alert } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFooterContainer,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "calc(100% - 4px)", md: "1000px" }, // Ancho completo en móvil menos 4px para borde
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 0, // Sin padding externo (lo manejamos en los elementos internos)
  overflow: "hidden", // Evita que el contenido se salga
  maxHeight: "90%", // Limita la altura máxima
  maxWidth: "90%", // Limita el ancho máximo en pantallas más grandes
  display: "flex",
  flexDirection: "column", // Asegura que el contenido sea un flujo vertical
};

interface UnidadFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

class Row {
  id: number;
  productoId?: number;
  cantidad: number;
  unidadId?: number;
  precio?: string;

  constructor(id: number, cantidad = 0, productoId?: number, unidadId?: number, precio?: string) {
    this.id = id;
    this.cantidad = cantidad;
    this.productoId = productoId;
    this.unidadId = unidadId;
    this.precio = precio;
  }
}

export default function RecetaFormModal({ openArg, onClose, idToOpen }: UnidadFormModalProps) {
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | undefined>(
    undefined,
  );
  const [id, setId] = useState<number>(0);
  const [open, setOpen] = useState(openArg);
  const [form, setForm] = useState<Receta>(new Receta());
  const [rows, setRows] = useState<Row[]>([]);
  const [isRowSelected, setIsRowSelected] = useState<boolean>(false);
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
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [mensajeDeError, setMensajeDeError] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [columnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
    unidadId: false,
  });

  const addRowFromIngrediente = (ingrediente: Ingrediente) => {
    const producto = productos.find((row: Producto) => row.id === ingrediente.productoId);
    const precio = ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;
    const newRow: Row = {
      id: ingrediente.id,
      productoId: ingrediente.productoId,
      unidadId: ingrediente.unidadId,
      cantidad: ingrediente.cantidad,
      precio: precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      }),
    };
    setRows((prevRows: Row[]) => {
      const existingRowIndex = prevRows.findIndex((row: Row) => row.id === newRow.id);
      if (existingRowIndex !== -1) {
        const updatedRows = [...prevRows];
        updatedRows[existingRowIndex] = newRow;
        return updatedRows;
      } else {
        return [...prevRows, newRow];
      }
    });
    actualizarTotal();
  };

  const actualizarTotal = () => {
    setTotal(
      rows.reduce((total: number, row: Row) => {
        if (typeof row.precio === "string") {
          const precioNumerico = parseFloat(row.precio.replace(/[^0-9,-]+/g, "").replace(",", "."));
          return total + (isNaN(precioNumerico) ? 0 : precioNumerico);
        }
        return total;
      }, 0),
    );
  };

  const handleIngredienteCloseDialogClose = () => {
    setOpenBorrarIngrediente(false);
    actualizarTotal();
  };

  const handleIngredienteCloseDialog = (id: number) => {
    setRows((prevRows: Row[]) => {
      return prevRows.filter((row) => row.id !== id);
    });
    actualizarTotal();
  };

  const handleRowSelection = (newSelectionModel: GridRowSelectionModel) => {
    const selectedRowId = Array.from(newSelectionModel.ids)[0];
    const selectedRowData = rows.find((row: Row) => row.id === selectedRowId);
    if (selectedRowData) {
      let cantidad = 0;
      if (typeof selectedRowData.cantidad === "string") {
        const cantidadString: string = selectedRowData.cantidad;
        cantidad = parseFloat(cantidadString.split(" ")[0]) || 0;
      } else if (typeof selectedRowData.cantidad === "number") {
        cantidad = selectedRowData.cantidad;
      }
      setIngredienteSeleccionado(
        new Ingrediente(
          Number(selectedRowData.id),
          selectedRowData.productoId,
          selectedRowData.unidadId,
          cantidad,
        ),
      );
      setIsRowSelected(true);
    } else {
      setIsRowSelected(false);
    }
  };

  type TypeOfRow = (typeof rows)[number];
  const GrillaRef = useGridApiRef();

  const fetchData = async () => {
    let totalFetchData = 0;
    if (idToOpen && productos.length > 0 && idToOpen !== id && unidades.length > 0) {
      try {
        setId(idToOpen);
        const result: Receta = await RecetaService.get(idToOpen);
        setForm(result);
        const nuevasFilas = result.ingredientes.map((ingrediente: Ingrediente) => {
          const producto = productos.find((row: Producto) => row.id === ingrediente.productoId);
          const precio =
            ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;
          totalFetchData += precio;
          return new Row(
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
        setTotal(totalFetchData); // Actualizar el total una sola vez aquí
      } catch (error) {
        console.error("Error fetching receta:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [idToOpen, productos, unidades]);

  useEffect(() => {
    actualizarTotal();
  }, [rows]);

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

  const columns: GridColDef<TypeOfRow>[] = [
    {
      field: "id",
      headerName: "IngredienteId",
      width: 10,
      type: "number",
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "productoId",
      headerName: "Paquete",
      flex: 2,
      minWidth: 150,
      type: "singleSelect",
      editable: true,
      disableColumnMenu: true,
      renderCell: (params) => {
        const producto = productos.find((p: Producto) => p.id === params.value);
        return producto ? producto.nombre : "Seleccionar producto";
      },
    },
    {
      field: "unidadId",
      headerName: "unidadId",
      width: 100,
      editable: false,
      disableColumnMenu: true,
      valueGetter: (_, row) => {
        const producto = productos.find((p: Producto) => p.id === row.productoId);
        return producto?.unidadId;
      },
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      flex: 1,
      minWidth: 100,
      type: "number",
      editable: true,
      disableColumnMenu: true,
    },
    {
      field: "precio",
      headerName: "Precio",
      flex: 1,
      minWidth: 100,
      editable: false,
      disableColumnMenu: true,
    },
  ];

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
    form.ingredientes = rows.map((row: Row) => {
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

  const CustomFooter = ({ total, rinde }: { total: number; rinde: number }) => {
    const totalAsString = (subtotal?: number) => {
      return (subtotal ?? total).toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      });
    };

    return (
      <GridFooterContainer>
        <Box sx={{ p: 1, display: "flex", justifyContent: "end" }}>
          <Typography variant="body2">
            Total: {totalAsString()} <br />
            Por Porción: {totalAsString(total / (rinde || 1))}
          </Typography>
        </Box>
      </GridFooterContainer>
    );
  };

  return (
    <div>
      <Modal open={open} onClose={handleCloseClick}>
        <>
          <Box component="form" onSubmit={handleSubmit} sx={style}>
            <Box
              sx={{
                position: "sticky",
                top: 0,
                bgcolor: "background.paper",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: "1px solid #ccc",
              }}>
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
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                p: 2,
              }}>
              <Box sx={{ width: "100%" }}>
                <TextField
                  label="ID"
                  name="id"
                  value={form.id}
                  margin="normal"
                  disabled
                  sx={{ width: { xs: "100%", md: "20%" } }}
                />
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handlerChangeNombre}
                  margin="normal"
                  sx={{
                    width: { xs: "100%", md: "60%" },
                    mx: { xs: 0, md: 2 },
                  }}
                />
                <TextField
                  label="Rinde Cuantas porciones"
                  name="rinde"
                  value={form.rinde}
                  onChange={handlerChangeRinde}
                  fullWidth
                  margin="normal"
                  sx={{
                    width: {
                      xs: "100%",
                      md: "calc(100% - (20% + 60% + 32px))",
                    },
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  minHeight: "400px",
                  height: "100%",
                  maxHeight: "500px",
                  flexDirection: { xs: "column", md: "row" },
                }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: { xs: "100%", md: "50%" },
                    flex: 1,
                  }}
                  id="grillaIngredientes">
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Ingredientes
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={agregarIngrediente}
                      sx={{
                        display: { xs: "flex", md: "inline-flex" },
                        minWidth: { xs: "auto", md: "64px" },
                        justifyContent: "center",
                      }}>
                      <Box sx={{ display: { xs: "none", md: "inline" } }}>Agregar</Box>
                    </Button>
                    <Button
                      startIcon={<EditIcon />}
                      disabled={!isRowSelected}
                      onClick={modificarIngrediente}
                      sx={{
                        display: { xs: "flex", md: "inline-flex" },
                        minWidth: { xs: "auto", md: "64px" },
                        justifyContent: "center",
                      }}>
                      <Box sx={{ display: { xs: "none", md: "inline" } }}>Modificar</Box>
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      disabled={!isRowSelected}
                      onClick={eliminarIngrediente}
                      sx={{
                        display: { xs: "flex", md: "inline-flex" },
                        minWidth: { xs: "auto", md: "64px" },
                        justifyContent: "center",
                      }}>
                      <Box sx={{ display: { xs: "none", md: "inline" } }}>Eliminar</Box>
                    </Button>
                  </Box>
                  <DataGrid
                    rows={rows}
                    apiRef={GrillaRef}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: -1,
                        },
                      },
                    }}
                    sx={{ height: "50vh" }}
                    onRowSelectionModelChange={handleRowSelection}
                    columnVisibilityModel={columnVisibilityModel}
                    slots={{
                      footer: () => <CustomFooter total={total} rinde={form.rinde ?? 1} />,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    mx: { xs: 0, md: 2 },
                    flex: 1,
                    width: { xs: "100%", md: "calc(50% - (32px))" },
                  }}
                  id="BoxObservaciones">
                  <Typography variant="body1" sx={{ mb: { xs: 0, md: 1 } }}>
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
                    sx={{
                      flexGrow: 1,
                      flex: 1,
                      minHeight: 0,
                      "& .MuiInputBase-root": {
                        height: "100%",
                        alignItems: "flex-start",
                      },
                      "& .MuiInputBase-input": {
                        height: "100%",
                        overflow: "auto",
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                bgcolor: "background.paper",
                zIndex: 2,
                display: "flex",
                justifyContent: "flex-end",
                p: 2,
                borderTop: "1px solid #ccc",
              }}>
              <Button type="submit" variant="contained" color="primary" sx={{ m: 1 }}>
                Enviar
              </Button>
              <Button variant="outlined" color="error" onClick={handleCloseClick} sx={{ m: 1 }}>
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
    </div>
  );
}
