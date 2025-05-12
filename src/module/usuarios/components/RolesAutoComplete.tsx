import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Checkbox, FormControl, FormHelperText } from "@mui/material";
import { Rol } from "../../contexts/Permisos";

interface RolesAutoCompleteProps {
  value: Rol[];
  onChange: (value: Rol[]) => void;
  error?: string;
}

export default function RolesAutoComplete({ value, onChange, error }: RolesAutoCompleteProps) {
  const options: Rol[] = [
    { code: "ROLE_ADMIN", nombre: "Administrador" },
    { code: "ROLE_USER", nombre: "Pasteleria" },
  ];
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        options={options}
        getOptionLabel={(option) => option?.nombre || "Sin nombre"}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} />
              {option.nombre}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label="Roles" placeholder="Roles" margin="dense" />
        )}
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
