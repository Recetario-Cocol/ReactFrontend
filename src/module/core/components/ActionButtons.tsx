import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Box, Button } from "@mui/material";

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
      <Button startIcon={<AddIcon />} disabled={agregar.isDisabled} onClick={agregar.onClick}>
        Agregar
      </Button>
      <Button startIcon={<EditIcon />} disabled={modificar.isDisabled} onClick={modificar.onClick}>
        Modificar
      </Button>
      <Button startIcon={<DeleteIcon />} disabled={borrar.isDisabled} onClick={borrar.onClick}>
        Eliminar
      </Button>
      {borrarConDependencias && (
        <Button
          startIcon={<DeleteIcon />}
          disabled={borrarConDependencias.isDisabled}
          onClick={borrarConDependencias.onClick}>
          Eliminar Con Dependencias
        </Button>
      )}
      {limpiarContrasenias && (
        <Button
          startIcon={<LockResetIcon />}
          disabled={limpiarContrasenias.isDisabled}
          onClick={limpiarContrasenias.onClick}>
          Restablecer Contraseña
        </Button>
      )}
    </Box>
  );
}
