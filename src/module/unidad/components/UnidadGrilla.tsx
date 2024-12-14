import { DataGrid, GridCallbackDetails, GridColDef, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import React, { useEffect, useState } from 'react';
import {Box, Button} from '@mui/material';
import UnidadFormModal, { AlertDialogBorrarUnidad } from './unidadFormModal';
import {useUnidadService} from '../useUnidadService';
import { Unidad } from '../Unidad';

export default function UnidadGrilla() {
  const [seleccionado, setSeleccionado] = React.useState(false);
  const [, setSelectionModel] = React.useState<GridRowSelectionModel>();
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUnidad, setOpenBorrarUnidad] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState([]); 
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

  function fetchRows(){
    UnidadService.getUnidades()
    .then((result) => {
      const unidadesApi = result.data ? 
        result.data.map((item: any) => 
          new Unidad(item.id, item.nombre, item.abreviacion)
        ):
        [];
      setRows(unidadesApi);
    }); 
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {field: 'id', headerName: 'ID', width: 90},
    {field: 'abreviacion', headerName: 'Abreviación', width: 150, editable: true},
    {field: 'nombre', headerName: 'Nombre', width: 150, editable: true}
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
  
  function  modificar() {
    setIdToOpen(getSelectedRowId());
    setOpenModal(true);
  }
  
  function  eliminar() {
    setIdToOpen(getSelectedRowId());
    setOpenBorrarUnidad(true);
  }
  
  function  filtrar() {
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
      {openModal && <UnidadFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen}/>}
      {openBorrarUnidad && <AlertDialogBorrarUnidad paramId={idToOpen} onClose={handleCloseDialog}/>}

    </div>
    </Box>
  );
}