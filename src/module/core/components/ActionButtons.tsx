import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Box, Button, SxProps, Theme } from "@mui/material";

interface ActionbuttonsProps {
  agregar: ActionbuttonsItemProps;
  modificar: ActionbuttonsItemProps;
  borrar: ActionbuttonsItemProps;
  borrarConDependencias?: ActionbuttonsItemProps;
  limpiarContrasenias?: ActionbuttonsItemProps;
}

interface ActionbuttonsItemProps {
  isDisabled: boolean;
  onClick: () => void;
  sx?: SxProps<Theme>;
}

export default function Actionbuttons({
  agregar,
  modificar,
  borrar,
  borrarConDependencias,
  limpiarContrasenias,
}: ActionbuttonsProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Button
        startIcon={<AddIcon />}
        disabled={agregar.isDisabled}
        onClick={agregar.onClick}
        sx={agregar.sx}>
        Agregar
      </Button>
      <Button
        startIcon={<EditIcon />}
        disabled={modificar.isDisabled}
        onClick={modificar.onClick}
        sx={modificar.sx}>
        Modificar
      </Button>
      <Button
        startIcon={<DeleteIcon />}
        disabled={borrar.isDisabled}
        onClick={borrar.onClick}
        sx={borrar.sx}>
        Eliminar
      </Button>
      {borrarConDependencias && (
        <Button
          startIcon={<DeleteIcon />}
          disabled={borrarConDependencias.isDisabled}
          onClick={borrarConDependencias.onClick}
          sx={borrarConDependencias.sx}>
          Eliminar Con Dependencias
        </Button>
      )}
      {limpiarContrasenias && (
        <Button
          startIcon={<LockResetIcon />}
          disabled={limpiarContrasenias.isDisabled}
          onClick={limpiarContrasenias.onClick}
          sx={limpiarContrasenias.sx}>
          Restablecer Contraseña
        </Button>
      )}
    </Box>
  );
}
