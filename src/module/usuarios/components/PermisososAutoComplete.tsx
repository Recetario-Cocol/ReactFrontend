import { useEffect, useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import useAxiosWithAuthentication from "../../core/useAxiosWithAuthentication";
import { API_BASE_URL } from "../../../config";
import { Permiso } from "../../contexts/Permisos";
import { FormControl, FormHelperText, Checkbox } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const apiEndpoint = API_BASE_URL + "/users/permissions/";

export interface PermisosAutoCompleteProps {
  value: number[];
  onChange: (value: Permiso[]) => void;
  error?: string;
}

export default function PermisosAutoComplete({
  value,
  onChange,
  error,
}: PermisosAutoCompleteProps) {
  const [options, setOptions] = useState<Permiso[]>([]);
  const [selectedPermisos, setSelectedPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(false);
  const axiosWithAuthentication = useAxiosWithAuthentication();
  const isFetched = useRef(false);
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    setLoading(true);
    axiosWithAuthentication
      .get(apiEndpoint)
      .then((response) => {
        const optionsOrdenadas = response.data.sort((a: Permiso, b: Permiso) => a.id - b.id);
        setOptions(optionsOrdenadas);
        const initialSelected = value
          .map((id) => optionsOrdenadas.find((option: Permiso) => option.id === id))
          .filter((option): option is Permiso => option !== undefined);
        setSelectedPermisos(initialSelected);
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, []);

  // Actualizar los permisos seleccionados cuando cambian las opciones o el value
  useEffect(() => {
    if (options.length > 0 && value.length > 0) {
      const newSelected = value
        .map((id) => options.find((option) => option.id === id))
        .filter((option): option is Permiso => option !== undefined);
      setSelectedPermisos(newSelected);
    }
  }, [options, value]);

  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        value={selectedPermisos}
        onChange={(_, newValue) => {
          setSelectedPermisos(newValue);
          onChange(newValue);
        }}
        options={options}
        getOptionLabel={(option) => option?.name || "Sin nombre"}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} />
              {option.name}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label="Permisos" placeholder="Permisos" margin="dense" />
        )}
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
