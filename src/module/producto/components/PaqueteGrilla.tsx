import { DataGrid, GridCallbackDetails, GridColDef, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import React, { useEffect, useState } from 'react';
import {Box, Button} from '@mui/material';
import PaqueteFormModal, { AlertDialogBorrarProducto} from './ProductoFormModal';
import { useProductoService } from '../useProductoService';
import Producto from '../Producto';
import { useUnidadService } from '../../unidad/useUnidadService';
import { Unidad } from '../../usuarios/Unidad';

interface Row {
  id: number;
  nombre: string;
  unidadId: number;
  precio: number;
  cantidad: number;
  nombreUnidad: string;
}


export default function PaqueteGrilla() {
  const [estaSelecionado, setEstaSelecionado] = React.useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarProducto, setOpenBorrarProducto] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]); 
  const ProductoService = useProductoService();
  const UnidadService = useUnidadService();

  const handleSeleccion = ( rowSelectionModel: GridRowSelectionModel) => {
    setEstaSelecionado(rowSelectionModel.length > 0);
  };

  const handleCloseModal = () => {
    fetchRows();
    setOpenModal(false);
  };

  const handleCloseDialog = () => {
    fetchRows();
    setOpenBorrarProducto(false);
  };

  useEffect(() => {
       fetchRows();
  });

  async function fetchRows() {
    try {
      const result = await ProductoService.getAll();
      if (result.data) {
        const productoFormApi = await Promise.all(
          result.data.map(async (item: any) => {
            const unidadResult = await UnidadService.getUnidad(item.unidadId);
            return {
              id: item.id,
              nombre: item.nombre,
              unidadId: item.unidadId,
              precio: item.precio,
              cantidad: item.cantidad,
              nombreUnidad: unidadResult.data.nombre,
            };
          })
        );
        setRows(productoFormApi);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Error al cargar los paquetes:", error);
      setRows([]);
    }
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {field: 'id', headerName: 'Id', width: 30},
    {field: 'nombre', headerName: 'Nombre', width: 200, editable: false, disableColumnMenu: true},
    {field: 'nombreUnidad', headerName: 'Unidad', width: 150, editable: false, disableColumnMenu: true},
    {field: 'precio', headerName: 'Precio', width: 100, editable: false, disableColumnMenu: true},
    {field: 'cantidad', headerName: 'Cantidad', width: 1100, editable: false, disableColumnMenu: true},
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

  return (
    <Box sx={{ height: 400, width: '100%', maxWidth: 800}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<AddIcon />} onClick={agregar}>Agregar</Button>
        <Button startIcon={<EditIcon />} disabled={!estaSelecionado} onClick={modificar}>Modificar</Button>
        <Button startIcon={<DeleteIcon />} disabled={!estaSelecionado} onClick={eliminar}>Eliminar</Button>
      </Box>
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
      />;
      <div>
        {openModal && <PaqueteFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen}/>}
        {openBorrarProducto && <AlertDialogBorrarProducto paramId={idToOpen} onClose={handleCloseDialog}/>}
      </div>
    </Box>
  );
}
