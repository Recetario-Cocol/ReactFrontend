import { DataGrid, GridCallbackDetails, GridColDef, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import React, { useEffect, useState } from 'react';
import {Box, Button} from '@mui/material';
import PaqueteFormModal, { AlertDialogBorrarPaquete} from './PaqueteFormModal';
import { usePaqueteService } from '../usePaqueteService';
import Paquete from '../Paquete';
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
  const [seleccionado, setSeleccionado] = React.useState(false);
  const [, setSelectionModel] = React.useState<GridRowSelectionModel>();
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUnidad, setOpenBorrarUnidad] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]); 
  const PaqueteService = usePaqueteService();
  const UnidadService = useUnidadService();


  const handleSeleccion = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails<any>
  ) => {
    setSeleccionado(rowSelectionModel.length > 0);
    setSelectionModel(rowSelectionModel);
  };

  const handleCloseModal = () => {
    fetchRows();
    setOpenModal(false);
  };

  const handleCloseDialog = () => {
    fetchRows();
    setOpenBorrarUnidad(false);
  };

  useEffect(() => {
       fetchRows();
  }, []);

  async function fetchRows() {
    try {
      const result = await PaqueteService.getAll();
      if (result.data) {
        const paquetesFormApi = await Promise.all(
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
        setRows(paquetesFormApi);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Error al cargar los paquetes:", error);
      setRows([]); // Manejar el error asignando un estado vacío
    }
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {field: 'id', headerName: 'ID', width: 30},
    {field: 'nombre', headerName: 'Nombre', width: 200, editable: false},
    {field: 'nombreUnidad', headerName: 'Unidad', width: 150, editable: false},
    {field: 'precio', headerName: 'Precio', width: 100, editable: false},
    {field: 'cantidad', headerName: 'Cantidad', width: 1100, editable: false},
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

  function agregar() {
    setIdToOpen(0);
    setOpenModal(true);
  }
  
  function modificar() {
    setIdToOpen(getSelectedRowId());
    setOpenModal(true);
  }
  
  function eliminar() {
    setIdToOpen(getSelectedRowId());
    setOpenBorrarUnidad(true);
  }
  
  function filtrar() {
    console.log("Filtrar");
  }

  return (
    <Box sx={{ height: 400, width: '100%', maxWidth: 800}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<AddIcon />} onClick={agregar}>Agregar</Button>
        <Button startIcon={<EditIcon />} disabled={!seleccionado} onClick={modificar}>Modificar</Button>
        <Button startIcon={<DeleteIcon />} disabled={!seleccionado} onClick={eliminar}>Eliminar</Button>
        <Button startIcon={<FilterListIcon />} onClick={filtrar}>Filtrar</Button>
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
        {openBorrarUnidad && <AlertDialogBorrarPaquete paramId={idToOpen} onClose={handleCloseDialog}/>}
      </div>
    </Box>
  );
}
