import { DataGrid, GridColDef, GridColumnVisibilityModel, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from 'react';
import {Box, Button, Snackbar, SnackbarCloseReason} from '@mui/material';
import PaqueteFormModal, { AlertDialogBorrarProducto} from './ProductoFormModal';
import { useProductoService } from '../useProductoService';
import { useUnidadService } from '../../unidad/useUnidadService';
import Producto from '../Producto';
import HeaderApp from '../../core/components/HeaderApp';
import { useAuth } from '../../contexts/AuthContext';
import { usePermisos } from '../../contexts/Permisos';

interface Row {
  id: number;
  nombre: string;
  unidadId: number;
  precio: number;
  cantidad: number;
  nombreUnidad: string;
  canBeDeleted: boolean;
}

export default function ProductoGrilla() {
  const [estaSelecionado, setEstaSelecionado] = React.useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarProducto, setOpenBorrarProducto] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<Row[]>([]); 
  const [canBeDelete, setCanBeDelete] = React.useState(false);
  const [columnVisibilityModel, ] = React.useState<GridColumnVisibilityModel>({canBeDeleted: false, id: false});
  const [mensajesModalBorrar, setMensajesModalBorrar] = useState<string>("");
  const ProductoService = useProductoService();
  const UnidadService = useUnidadService();
  const { SAVE_PAQUETE, CREATE_PAQUETE, DELETE_PAQUETE } = usePermisos();
  const { hasPermission } = useAuth();

  const handleSeleccion = ( rowSelectionModel: GridRowSelectionModel) => {
    setEstaSelecionado(rowSelectionModel.length > 0);
    const selectedRow = rows.find((row) => row.id === rowSelectionModel[0]);
    setCanBeDelete(!!selectedRow?.canBeDeleted);
  };

  const handleCloseModal = () => {
    fetchRows();
    setOpenModal(false);
  };

  const handleCloseDialog = (mensaje: string) => {
    fetchRows();
    setOpenBorrarProducto(false);
    setMensajesModalBorrar(mensaje);
  };

  useEffect(() => {
       fetchRows();
  },[]);

  async function fetchRows() {
    try {
      const result = await ProductoService.getAll();
      if (result.data) {
        const productoFormApi = await Promise.all(
          result.data.map(async (item: Producto) => {
            const unidadResult = await UnidadService.getUnidad(item.unidadId);
            return {
              id: item.id,
              nombre: item.nombre,
              unidadId: item.unidadId,
              precio: item.precio,
              cantidad: item.cantidad + " " + unidadResult.data.abreviacion,
              canBeDeleted: item.canBeDeleted
            };
          })
        );
        setRows(productoFormApi);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      setRows([]);
    }
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {field: 'id', headerName: 'Id', width: 30},
    {field: 'nombre', headerName: 'Nombre', width: 200, editable: false, disableColumnMenu: true},
    {field: 'cantidad', headerName: 'Cantidad', width: 100, editable: false, disableColumnMenu: true},
    {field: 'precio', headerName: 'Precio', width: 100, editable: false, disableColumnMenu: true},
    {field: 'canBeDeleted', headerName: 'canBeDeleted', width: 150, editable: false,  disableColumnMenu: true}
  ];

  function getSelectedRowId(): number {
    if (GrillaRef.current) {
      const selectedRows = GrillaRef.current.getSelectedRows();
      if (selectedRows && selectedRows.size > 0) {
        const firstSelectedRow = selectedRows.entries().next().value?.[0] ?? 0;
        return typeof firstSelectedRow === 'number' ? firstSelectedRow : Number(firstSelectedRow) || 0;
      }
    }
    return 0; 
  }

  function agregar(): void {
    setIdToOpen(0);
    setOpenModal(true);
  }
  
  function modificar(): void {
    setIdToOpen(getSelectedRowId());
    setOpenModal(true);
  }
  
  function eliminar(): void {
    setIdToOpen(getSelectedRowId());
    setOpenBorrarProducto(true);
  }

  function handleSnackBarClose(event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) {
    if (reason === 'clickaway') {
      return;
    }
    setMensajesModalBorrar("");
  };

  return <Box sx={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
    <HeaderApp titulo="Productos" />
    <Box sx={{display: 'flex', flexDirection: 'column',  flex: 1, width: '100%', maxWidth: 800}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Button startIcon={<AddIcon />} disabled={!hasPermission(CREATE_PAQUETE)} onClick={agregar}>Agregar</Button>
        <Button startIcon={<EditIcon />} disabled={!hasPermission(SAVE_PAQUETE) || !estaSelecionado} onClick={modificar}>Modificar</Button>
        <Button startIcon={<DeleteIcon />} disabled={!hasPermission(DELETE_PAQUETE) || !canBeDelete} onClick={eliminar}>Eliminar</Button>
      </Box>
      <Snackbar open={mensajesModalBorrar !== ""} autoHideDuration={5000} message={mensajesModalBorrar} onClose={handleSnackBarClose}/>
      <Box sx={{ flex: 1}}>
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
          onRowSelectionModelChange={handleSeleccion}
          disableMultipleRowSelection
          columnVisibilityModel={columnVisibilityModel}
        />
      </Box>
      <div>
        {openModal && <PaqueteFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen}/>}
        {openBorrarProducto && <AlertDialogBorrarProducto paramId={idToOpen} onClose={handleCloseDialog}/>}
      </div>
    </Box>
  </Box>;
}
