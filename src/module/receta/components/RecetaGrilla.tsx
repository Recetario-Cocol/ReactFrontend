import { DataGrid, GridCallbackDetails, GridColDef, GridRowSelectionModel, useGridApiRef, GridColumnVisibilityModel} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from 'react';
import {Box, Button} from '@mui/material';
import RecetaFormModal, {AlertDialogBorrarReceta} from './RecetaFormModal';
import { useRecetaService } from '../useRecetaService';
import HeaderApp from '../../core/components/HeaderApp';

export default function RecetaGrilla() {
  const [seleccionado, setSeleccionado] = React.useState(false);
  const [, setSelectionModel] = React.useState<GridRowSelectionModel>();
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUnidad, setOpenBorrarUnidad] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]); 
  const RecetaService = useRecetaService();
  const [columnVisibilityModel, ] = React.useState<GridColumnVisibilityModel>({canBeDeleted: false, id: false});


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

  async function fetchRows() {
    try {
      const result = await RecetaService.getGrilla();
      if (result.data) {
        setRows(result.data);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Error al cargar los paquetes:", error);
      setRows([]); // Manejar el error asignando un estado vacío
    }
  }

  useEffect(() => {
    fetchRows();
  }, [])

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {field: 'id', headerName: 'ID', width: 30, editable: false, disableColumnMenu: true},
    {field: 'nombre', headerName: 'Nombre', width: 300, editable: false, disableColumnMenu: true}, 
    {field: 'ingredientes', headerName: 'Ingredientes', width: 500, editable: false, disableColumnMenu: true}, 
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

  return <Box sx={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
    <HeaderApp titulo="Recetas" />
    <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: 800}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Button startIcon={<AddIcon />} onClick={agregar}>Agregar</Button>
        <Button startIcon={<EditIcon />} disabled={!seleccionado} onClick={modificar}>Modificar</Button>
        <Button startIcon={<DeleteIcon />} disabled={!seleccionado} onClick={eliminar}>Eliminar</Button>
      </Box>
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
          columnVisibilityModel={columnVisibilityModel}
        />
      </Box>
      <div>
        {openModal && <RecetaFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen}/>}
        {openBorrarUnidad && <AlertDialogBorrarReceta paramId={idToOpen} onClose={handleCloseDialog}/>}
      </div>
    </Box>
  </Box>;
}
