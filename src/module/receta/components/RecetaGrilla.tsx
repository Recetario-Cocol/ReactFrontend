import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  useGridApiRef,
  GridColumnVisibilityModel,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import RecetaFormModal from "./RecetaFormModal";
import AlertDialogBorrarReceta from "./AlertDialogBorrarReceta";
import { GrillaReceta, useRecetaService } from "../useRecetaService";
import HeaderApp from "../../core/components/HeaderApp";
import { usePermisos } from "../../contexts/Permisos";
import { useAuth } from "../../contexts/AuthContext";
import Actionbuttons from "../../core/components/ActionButtons";

export default function RecetaGrilla() {
  const [seleccionado, setSeleccionado] = useState(false);
  const [, setSelectionModel] = useState<GridRowSelectionModel>();
  const [openModal, setOpenModal] = useState(false);
  const [openBorrarUnidad, setOpenBorrarUnidad] = useState(false);
  const [idToOpen, setIdToOpen] = useState<number>(0);
  const [rows, setRows] = useState<GrillaReceta[]>([]);
  const RecetaService = useRecetaService();
  const [columnVisibilityModel] = useState<GridColumnVisibilityModel>({
    canBeDeleted: false,
    id: false,
  });
  const { change_receta, add_receta, delete_receta } = usePermisos();
  const { hasPermission } = useAuth();

  const handleSeleccion = (rowSelectionModel: GridRowSelectionModel) => {
    const firstId = Array.from(rowSelectionModel.ids)[0];
    const selectedRow = rows.find((row: GrillaReceta) => row.id === firstId);
    setSeleccionado(rowSelectionModel.ids.size > 0);
    setSelectionModel(rowSelectionModel);
    if (selectedRow?.id) setIdToOpen(selectedRow?.id);
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
      setRows([]);
      RecetaService.getGrilla().then((result: GrillaReceta[]) => setRows(result));
    } catch (error) {
      console.error("Error al cargar los paquetes:", error);
      setRows([]);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  const GrillaRef = useGridApiRef();
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 30,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "nombre",
      headerName: "Nombre",
      width: 300,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: "ingredientes",
      headerName: "Ingredientes",
      width: 500,
      editable: false,
      disableColumnMenu: true,
    },
  ];

  function agregar() {
    setIdToOpen(0);
    setOpenModal(true);
  }

  function modificar() {
    setOpenModal(true);
  }

  function eliminar() {
    setOpenBorrarUnidad(true);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <HeaderApp titulo="Recetas" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          maxWidth: 800,
        }}>
        <Actionbuttons
          agregar={{ isDisabled: !hasPermission(add_receta), onClick: agregar }}
          modificar={{
            isDisabled: !hasPermission(change_receta) || !seleccionado,
            onClick: modificar,
          }}
          borrar={{ isDisabled: !hasPermission(delete_receta) || !seleccionado, onClick: eliminar }}
        />
        <Box sx={{ flex: 1 }}>
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
          {openModal && (
            <RecetaFormModal openArg={openModal} onClose={handleCloseModal} idToOpen={idToOpen} />
          )}
          {openBorrarUnidad && (
            <AlertDialogBorrarReceta paramId={idToOpen} onClose={handleCloseDialog} />
          )}
        </div>
      </Box>
    </Box>
  );
}
