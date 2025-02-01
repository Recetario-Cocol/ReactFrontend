import { DataGrid, GridCallbackDetails, GridColDef, GridColumnVisibilityModel, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from 'react';
import {Box, Button, Snackbar, SnackbarCloseReason} from '@mui/material';
import { Usuario } from '../Usuario';
import HeaderApp from '../../core/components/HeaderApp';
import { useUserService } from '../useUserService';
import UserFormModal, { AlertDialogBorrarUsuario } from './UsuarioFormModal';
import { useAuth } from '../../contexts/AuthContext';

export default function UsuariosGrilla() {
  const [seleccionado, setSeleccionado] = React.useState(false);
  const [canBeDelete, setCanBeDelete] = React.useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUsuario, setOpenBorrarUsuario] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<Usuario[]>([]); 
  const UserService = useUserService();
  const [mensajesModalBorrar, setMensajesModalBorrar] = useState<string>("");
  const [columnVisibilityModel, ] = React.useState<GridColumnVisibilityModel>({canBeDeleted: false, id: false});
  const { isAdmin } = useAuth();

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
    setOpenBorrarUsuario(false);
    setMensajesModalBorrar(mensaje);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  function fetchRows(){
    UserService.getUsuarios()
    .then((result) => {
      const usuariosApi = result.data ? 
        result.data.map((item: any) => 
          new Usuario(item.id, item.fullName, item.email, item.canBeDeleted)
        ):
        [];
      setRows(usuariosApi);
    }); 
  }

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {field: 'id', headerName: 'Id', width: 80, disableColumnMenu: true},
    {field: 'fullName', headerName: 'fullName.', width: 100, editable: false, disableColumnMenu: true},
    {field: 'email', headerName: 'Email', width: 200, editable: false,  disableColumnMenu: true},
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
    setOpenBorrarUsuario(true);
  }

  function handleSnackBarClose(event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) {
    if (reason === 'clickaway') {
      return;
    }
    setMensajesModalBorrar("");
  };

  return <Box sx={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <HeaderApp titulo="Usuarios" />
      <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, width: '100%', maxWidth: 800}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Button startIcon={<AddIcon />} disabled={true || !isAdmin} onClick={agregar}>Agregar</Button>
          <Button startIcon={<EditIcon />} disabled={!isAdmin || !seleccionado} onClick={modificar}>Modificar</Button>
          <Button startIcon={<DeleteIcon />} disabled={!isAdmin || !canBeDelete} onClick={eliminar}>Eliminar</Button>
          <Button startIcon={<DeleteIcon />} disabled={!isAdmin || !seleccionado} onClick={eliminar}>Eliminar Con Dependencias</Button>
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
           {openModal && <UserFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen}/>}
          {openBorrarUsuario && <AlertDialogBorrarUsuario paramId={idToOpen} onClose={handleCloseDialog} forced={!canBeDelete}/>}
        </div>
      </Box>
    </Box>;
}