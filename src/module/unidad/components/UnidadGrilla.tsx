import { DataGrid, GridCallbackDetails, GridColDef, GridColumnVisibilityModel, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from 'react';
import {Box, Button, Snackbar, SnackbarCloseReason} from '@mui/material';
import UnidadFormModal, { AlertDialogBorrarUnidad } from './unidadFormModal';
import {useUnidadService} from '../useUnidadService';
import { Unidad } from '../Unidad';
import HeaderApp from '../../core/components/HeaderApp';

export default function UnidadGrilla() {
  const [seleccionado, setSeleccionado] = React.useState(false);
  const [canBeDelete, setCanBeDelete] = React.useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUnidad, setOpenBorrarUnidad] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<Unidad[]>([]); 
  const UnidadService = useUnidadService();
  const [mensajesModalBorrar, setMensajesModalBorrar] = useState<string>("");
  const [columnVisibilityModel, ] = React.useState<GridColumnVisibilityModel>({canBeDeleted: false, id: false});

  const handleSeleccion = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails<any>
  ) => {
    const selectedRow = rows.find((row) => row.id === rowSelectionModel[0]);
    setCanBeDelete(!!selectedRow?.canBeDeleted);
    setSeleccionado(rowSelectionModel.length > 0);
  };

  const handleCloseModal = () => {
    fetchRows();
    setOpenModal(false);
  };

  const handleCloseDialog = (mensaje: string) => {
    fetchRows();
    setOpenBorrarUnidad(false);
    setMensajesModalBorrar(mensaje);
  };

  useEffect(() => {
       fetchRows();
  }, []);

  function fetchRows(){
    UnidadService.getUnidades()
    .then((result) => {
      const unidadesApi = result.data ? 
        result.data.map((item: any) => 
          new Unidad(item.id, item.nombre, item.abreviacion, item.canBeDeleted)
        ):
        [];
      setRows(unidadesApi);
    }); 
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {field: 'id', headerName: 'Id', width: 80, disableColumnMenu: true},
    {field: 'abreviacion', headerName: 'Abrev.', width: 100, editable: false, disableColumnMenu: true},
    {field: 'nombre', headerName: 'Nombre', width: 200, editable: false,  disableColumnMenu: true},
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

  function handleSnackBarClose(event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) {
    if (reason === 'clickaway') {
      return;
    }
    setMensajesModalBorrar("");
  };

  return <Box sx={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <HeaderApp titulo="Unidades" />
      <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: 800}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Button startIcon={<AddIcon />} onClick={agregar}>Agregar</Button>
          <Button startIcon={<EditIcon />} disabled={!seleccionado} onClick={modificar}>Modificar</Button>
          <Button startIcon={<DeleteIcon />} disabled={!canBeDelete} onClick={eliminar}>Eliminar</Button>
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
            disableMultipleRowSelection
            pageSizeOptions={[10]}
            onRowSelectionModelChange={handleSeleccion}
            columnVisibilityModel={columnVisibilityModel}
          />  
        </Box> 
        <div>
          {openModal && <UnidadFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen}/>}
          {openBorrarUnidad && <AlertDialogBorrarUnidad paramId={idToOpen} onClose={handleCloseDialog}/>}
        </div>
      </Box>
    </Box>;
}