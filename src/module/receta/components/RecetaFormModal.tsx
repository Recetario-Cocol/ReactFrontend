import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton} from '@mui/material';
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridRowSelectionModel, useGridApiRef} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Receta from '../Receta';
import { useRecetaService } from '../useRecetaService';
import { usePaqueteService } from '../../paquete/usePaqueteService';
import { useUnidadService } from '../../unidad/useUnidadService';
import { styled } from "@mui/system";
import Paquete from '../../paquete/Paquete';
import { Unidad } from '../../unidad/Unidad';
import Ingrediente from '../../ingrediente/Ingrediente';
import IngredienteModal, { AlertDialogBorrarIngrediente } from '../../ingrediente/components/IngredienteModal';

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
    const PaqueteService = usePaqueteService();
    const UnidadService = useUnidadService();
    const [productos, setProductos] = useState<Paquete[]>([]); 
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [openIngredienteModal, setOpenIngredienteModal] = useState(false);
    const onHanderSubmitIngrediente = (ingrediente: Ingrediente | undefined) => {
      if (ingrediente) addRowFromIngrediente(ingrediente);
    };
    const [openBorrarIngrediente, setOpenBorrarIngrediente] = useState(false);
    const handleCloseIngredienteModal = () => {
      setOpenIngredienteModal(false);
    };

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
      setRows((prevRows) => {
        return prevRows.filter(row => row.id !== id);
      });
    }

    const [ingredienteIdToDelete, setIngredienteIdToDelete] = useState<number>(0);

    const handleRowSelection = (newSelectionModel: GridRowSelectionModel) => {
      console.log(newSelectionModel);
      const selectedRowId = newSelectionModel[0];
      const selectedRowData = rows.find((row:Row) => row.id === selectedRowId);
      if (selectedRowData) {
        setIngredienteSeleccionado(new Ingrediente(
          Number(selectedRowData.id), 
          selectedRowData.paqueteId, 
          selectedRowData.unidadId,
          selectedRowData.cantidad
        ));
      } 
    };

    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

    type TypeOfRow = (typeof rows)[number];
    const GrillaRef = useGridApiRef();

    const fetchData = async () => {
      if (id) {
        try {
          const result = await RecetaService.get(id);
          const item = result.data;
          setForm(new Receta(
            item.id || 0,
            item.nombre || '',
            item.rinde || 0,
            item.ingredientes || []
          ));
          setRows(
            item.ingredientes.map((ingrediente: Ingrediente, index: number) => ({
              id: ingrediente.id,
              paqueteId: ingrediente.paqueteId,
              unidadId: ingrediente.unidadId,
              cantidad: ingrediente.cantidad,
              precio: "0",
            }))
          );
        } catch (error) {
          console.error('Error fetching receta:', error);
        }
      } else {
        setForm(new Receta(0, '', 0, []));
      }
    };
  
    useEffect(() => {
      setLoadingProducts(true);
      try {
        PaqueteService.getAll()                      
        .then((response) => setProductos(response.data));
        UnidadService.getUnidades()                      
        .then((response) => setUnidades(response.data));
      } catch (error) {
        console.error('Error al cargar los productos/unidades:', error);
      } finally {
        setLoadingProducts(false);
      }
      fetchData();
    }, [id]);

    const getPrecioProducto = (paqueteId?: number) => {
        const producto = productos.find((p) => p.id === paqueteId);
        return producto ? `$ ${producto.precio}` : 'Sin Precio';
    }

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
      {field: 'precio', headerName: 'Precio', width: 100, editable: false, disableColumnMenu: true, valueGetter: (value, row) => getPrecioProducto(row.paqueteId)}
    ];

    const handleClose = () => {
      if(onClose) onClose();
      setOpen(false);
    }

    const handlerChangeNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prevForm) => new Receta(prevForm.id,  value || '', prevForm.rinde, prevForm.ingredientes));
    }

    const handlerChangeRinde = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prevForm) => new Receta(prevForm.id,  prevForm.nombre, Number(value) || 0, prevForm.ingredientes));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      form.ingredientes = rows.map((row: Row, index: number) => {
        return new Ingrediente(row.id, row.paqueteId, row.unidadId, row.cantidad);
      });
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

    const [columnVisibilityModel, ] = React.useState<GridColumnVisibilityModel>({
      id: false,
      unidadId: false
    });
    
    return (
      <div>
        <Modal open={open} onClose={handleClose}>
          <Box sx={style}>
            <Typography variant="h6" component="h2">
              Receta
              <IconButton aria-label="close" onClick={handleClose} sx={{position: 'absolute', right: 8, top: 8, }}>
                <CloseIcon />
              </IconButton>
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField label="ID" name="id" value={form.id} margin="normal" disabled sx={{ width: "10%"}}/>
              <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handlerChangeNombre} fullWidth margin="normal" sx={{ width: "50%", mx: 2}}/>
              <TextField label="Rinde Cauntas porciones" name="rinde" value={form.rinde} onChange={handlerChangeRinde} fullWidth margin="normal"sx={{ width: `calc(100% - (10% + 50% + 32px))`}}/>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button startIcon={<AddIcon />} disabled={loadingProducts} onClick={agregarIngrediente}>Agregar</Button>
                <Button startIcon={<EditIcon />} disabled={loadingProducts && !ingredienteSeleccionado} onClick={modificarIngrediente}>Modificar</Button>
                <Button startIcon={<DeleteIcon />} disabled={loadingProducts && !ingredienteSeleccionado} onClick={eliminarIngrediente}>Eliminar</Button>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Ingredientes
              </Typography>
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
                />         
              <Button type="submit" variant="contained" color="primary">
                Enviar
              </Button>
              <Button variant="outlined" color="error" onClick={handleClose}>
                Cancelar
              </Button>
            </Box>                 
            <div>
                {!loadingProducts && openIngredienteModal && 
                  <IngredienteModal
                    openArg={openIngredienteModal}
                    onSubmit={onHanderSubmitIngrediente}
                    ingredienteParam={ingredienteSeleccionado}
                    unidades={unidades}
                    productos={productos}
                    onClose={handleCloseIngredienteModal} // Pasar la función de cierre¿
                    />
                }
                {!loadingProducts && openBorrarIngrediente && 
                  <AlertDialogBorrarIngrediente
                    paramId={ingredienteIdToDelete}
                    onSubmit={handleIngredienteCloseDialog}
                    onClose={handleIngredienteCloseDialogClose}/>
                  }
            </div>
          </Box>
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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
      >
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
