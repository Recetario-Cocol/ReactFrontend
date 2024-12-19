import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Alert} from '@mui/material';
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridFooter, GridFooterContainer, GridRowSelectionModel, useGridApiRef} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Receta from '../Receta';
import { useRecetaService } from '../useRecetaService';
import { useProductoService } from '../../producto/useProductoService';
import { useUnidadService } from '../../unidad/useUnidadService';
import Producto from '../../producto/Producto';
import { Unidad } from '../../unidad/Unidad';
import Ingrediente from '../../ingrediente/Ingrediente';
import IngredienteModal, { AlertDialogBorrarIngrediente } from '../../ingrediente/components/IngredienteModal';
import { displayPartsToString } from 'typescript';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface UnidadFormModalProps {
  openArg: boolean;
  onClose?: () => void;
  idToOpen: number;
}

class Row {
  id: number;
  paqueteId?: number;
  cantidad: number;
  unidadId?: number;
  precio?: string;

  constructor(
    id: number,
    cantidad = 0,
    paqueteId?: number,
    unidadId?: number,
    precio?: string
  ) {
    this.id = id;
    this.cantidad = cantidad;
    this.paqueteId = paqueteId;
    this.unidadId = unidadId;
    this.precio = precio;
  }
}

export default function RecetaFormModal({ openArg, onClose, idToOpen}: UnidadFormModalProps) {
    const [ingredienteSeleccionado, setIngredienteSeleccionado] = React.useState<Ingrediente | undefined>(undefined);
    const [id,] = useState(idToOpen);
    const [open, setOpen] = useState(openArg);
    const [form, setForm] = useState<Receta>(new Receta());
    const [rows, setRows] = useState<Row[]>([]); 
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
    const [mensajeDeError, setMensajeDeError] = useState<String>("");
    const [total, setTotal] = useState<number>(0);
    const [columnVisibilityModel, ] = React.useState<GridColumnVisibilityModel>({id: false, unidadId: false});

    const addRowFromIngrediente = (ingrediente: Ingrediente) => {
      const newRow: Row = {
        id: ingrediente.id,
        paqueteId: ingrediente.paqueteId,
        unidadId: ingrediente.unidadId,
        cantidad: ingrediente.cantidad,
        precio: "0",
      };    
      setRows((prevRows) => {
        const existingRowIndex = prevRows.findIndex((row:Row) => row.id === newRow.id);
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
    }

    const handleIngredienteCloseDialog = (id: number) => {
      setRows((prevRows) => {return prevRows.filter(row => row.id !== id);});
    }

    const handleRowSelection = (newSelectionModel: GridRowSelectionModel) => {
      const selectedRowId = newSelectionModel[0];
      const selectedRowData = rows.find((row:Row) => row.id === selectedRowId);
      if (selectedRowData) {
        setIngredienteSeleccionado(new Ingrediente( Number(selectedRowData.id), selectedRowData.paqueteId, selectedRowData.unidadId, selectedRowData.cantidad));
      }
    };

    type TypeOfRow = (typeof rows)[number];
    const GrillaRef = useGridApiRef();

    const fetchData = async () => {
      let totalFetchData = 0;
      if (id) {
        try {
          const result = await RecetaService.get(id);
          const item = result.data;
          setForm(new Receta(item.id, item.nombre, item.rinde, item.ingredientes, item.observaciones ?? ''));
          if (productos.length > 0) {
            setRows(item.ingredientes.map((ingrediente: Ingrediente, index: number) => {
              const producto = productos.find((row) => row.id === ingrediente.paqueteId);
              const precio = ((producto?.precio ?? 0) / (producto?.cantidad ?? 1) * ingrediente.cantidad);
              totalFetchData += precio
              return {
                id: ingrediente.id,
                paqueteId: ingrediente.paqueteId,
                unidadId: ingrediente.unidadId,
                cantidad: ingrediente.cantidad,
                precio: precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
              };
            }));
            setTotal(totalFetchData);
          }
        } catch (error) {
          console.error('Error fetching receta:', error);
        }
      } else {
        setForm(new Receta());
      }
    };
  
    useEffect(() => {
      setLoadingProducts(true);
      try {
        ProductoService.getAll()                      
        .then((response) => setProductos(response.data));
        UnidadService.getUnidades()                      
        .then((response) => setUnidades(response.data));
      } catch (error) {
        console.error('Error al cargar los productos/unidades:', error);
      } finally {
        setLoadingProducts(false);
      }
      fetchData();
    }, [id, productos.length, unidades.length]);

    const columns: GridColDef<TypeOfRow>[] = [
      {field: 'id', headerName: 'IngredienteId', width: 100, type: 'number', editable: false, disableColumnMenu: true}, 
      {field: 'paqueteId', headerName: 'Paquete',width: 200, type: 'singleSelect', editable: true, disableColumnMenu: true, 
        renderCell: (params) => {
          const producto = productos.find((p) => p.id === params.value);
          return producto ? producto.nombre : 'Seleccionar producto';
        }
      },
      {field: 'cantidad', headerName: 'Cantidad', width: 100, type: 'number', editable: true, disableColumnMenu: true}, 
      {field: 'unidadId', headerName: 'unidadId', width: 100, editable: false, disableColumnMenu: true, valueGetter: (value, row) => {
        const producto = productos.find((p) => p.id === row.paqueteId);
        return producto?.unidadId;
      }},
      {field: 'abreviacion', headerName: 'Abreviacion', width: 100, editable: false, disableColumnMenu: true, valueGetter: (value, row) => {
        const producto = productos.find((p) => p.id === row.paqueteId);
        const unidad = unidades.find((p) => p.id === producto?.unidadId);
        return unidad?.abreviacion;
      }},
      {field: 'precio', headerName: 'Precio', width: 100, editable: false, disableColumnMenu: true}
    ];

    const handleClose = () => {
      if(onClose) onClose();
      setOpen(false);
    }

    const handlerChangeNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prevForm) => new Receta(prevForm.id,  value || '', prevForm.rinde, prevForm.ingredientes, prevForm.observaciones));
    }

    const handlerChangeRinde = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prevForm) => new Receta(prevForm.id,  prevForm.nombre, Number(value) || 0, prevForm.ingredientes, prevForm.observaciones));
    }

    const handlerChangeObservaciones = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      console.log(value); 
      setForm((prevForm) => new Receta(prevForm.id,  prevForm.nombre, prevForm.rinde, prevForm.ingredientes, value || ''));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      form.ingredientes = rows.map((row: Row, index: number) => {
        return new Ingrediente(row.id, row.paqueteId, row.unidadId, row.cantidad);
      });

      if (!form.nombre){
        setMensajeDeError("Ingrese un nombre.");
        return;
      }

      if (!form.rinde){
        setMensajeDeError("Ingrese cuantas rinde la receta.");
        return;
      }

      if (form.ingredientes.length < 1){
        setMensajeDeError("Ingrese al menos un ingrediente");
        return;
      }
      console.log(form);

      if (id) {
        RecetaService.actualizar(id, form).then((result)=>{
          handleClose();
        });
      } else {
        RecetaService.crear(form).then((result)=>{
          handleClose();
        });
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

    const totalAsString = (subtotal?: number) => {
      return (subtotal ?? total).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };  

    const CustomFooter = () => {
      return (
        <GridFooterContainer>
          <GridFooter />
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Total: {totalAsString()} | Por Porcion: {totalAsString(total/(form.rinde ?? 0))}</Typography>
          </Box>
        </GridFooterContainer>
      );
    };
    
    return (
      <div>
        <Modal open={open} onClose={handleClose}>
          <>
          <Box component="form" onSubmit={handleSubmit}  sx={style}>
            <Typography variant="h6" component="h2">
              Receta
              <IconButton aria-label="close" onClick={handleClose} sx={{position: 'absolute', right: 8, top: 8, }}>
                <CloseIcon />
              </IconButton>
            </Typography>
            {mensajeDeError && <Alert severity="success" color="warning">{mensajeDeError}</Alert>}
            <Box sx={{ width: '100%' }}>
              <TextField label="ID" name="id" value={form.id} margin="normal" disabled sx={{ width: "20%"}}/>
              <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handlerChangeNombre} margin="normal" sx={{ width: "60%", mx: 2}}/>
              <TextField label="Rinde Cuantas porciones" name="rinde" value={form.rinde} onChange={handlerChangeRinde} fullWidth margin="normal" sx={{ width: `calc(100% - (20% + 60% + 32px))`}}/>
            </Box>
            <Box sx={{ display: 'flex', width: '100%' }}>
              <Box sx={{ width: '50%' }} id="grillaIngredientes">
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Ingredientes
                </Typography>
                <Button startIcon={<AddIcon />} disabled={loadingProducts} onClick={agregarIngrediente}>Agregar</Button>
                <Button startIcon={<EditIcon />} disabled={loadingProducts && !ingredienteSeleccionado} onClick={modificarIngrediente}>Modificar</Button>
                <Button startIcon={<DeleteIcon />} disabled={loadingProducts && !ingredienteSeleccionado} onClick={eliminarIngrediente}>Eliminar</Button>
                <DataGrid
                  rows={rows}
                  apiRef={GrillaRef}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                      },
                    },
                  }}
                  pageSizeOptions={[10]}
                  sx={{ height: "50vh" }}
                  onRowSelectionModelChange={handleRowSelection}
                  columnVisibilityModel={columnVisibilityModel}                    
                  slots={{
                    footer: CustomFooter,
                  }}
                />         
              </Box>
              <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }} id="BoxObservaciones">
                <Typography variant="body1" sx={{ mb: 1 }}>
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
                    marginBottom: 1,
                    flex:1,
                    
    textAlign: 'left',     // Alineación horizontal
    verticalAlign: 'top',  // (Opcional, no es estrictamente necesario)
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Button type="submit" variant="contained" color="primary">Enviar</Button>
              <Button variant="outlined" color="error" onClick={handleClose}>Cancelar</Button>
            </Box>   
          </Box>
          <Box>
            {!loadingProducts && openIngredienteModal && 
              <IngredienteModal
                openArg={openIngredienteModal}
                onSubmit={onHanderSubmitIngrediente}
                ingredienteParam={ingredienteSeleccionado}
                unidades={unidades}
                productos={productos}
                onClose={handleCloseIngredienteModal}
              />
            }
            {!loadingProducts && openBorrarIngrediente && 
              <AlertDialogBorrarIngrediente paramId={ingredienteIdToDelete} onSubmit={handleIngredienteCloseDialog} onClose={handleIngredienteCloseDialogClose}/>
            } 
          </Box>
          </>
        </Modal>
      </div>
    );
  }


type AlertDialogBorrarRecetaProps = {
  paramId: number;
  onClose?: () => void;
};

export function AlertDialogBorrarReceta({ paramId, onClose }: AlertDialogBorrarRecetaProps): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  const [id,] = React.useState(paramId);
  const RecetaService = useRecetaService();

  const handlerClickSi = () => {
    RecetaService.eliminar(id).then().then((result)=>{ handleClose();});
  }

  const handleClose = () => {
    if(onClose) onClose();
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title">
        <DialogTitle id="alert-dialog-title">
          {"¿Desea Borrar la Receta?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>No</Button>
          <Button onClick={handlerClickSi}>Si</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
