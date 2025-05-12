import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import useAxiosWithAuthentication from "../../core/useAxiosWithAuthentication";
import { API_BASE_URL } from "../../../config";
const apiEndpoint = API_BASE_URL + "/Permisos";

interface Permiso {
  codigo: string;
  nombre: string;
  descripcion: string;
}

export default function UserAutoComplete() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly Permiso[]>([]);
  const [loading, setLoading] = useState(false);
  const axiosWithAuthentication = useAxiosWithAuthentication();

  useEffect(() => {
    const fetchConstants = async () => {
      try {
        setLoading(true);
        const response = await axiosWithAuthentication.get(apiEndpoint);
        const permisosData = response.data;
        setOptions(permisosData);
        setLoading(false);
      } catch (error) {
        console.warn("Error al cargar los permisos:", error);
        setOptions([]);
      }
    };
    fetchConstants();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      sx={{ width: 300 }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option.codigo === value.codigo}
      getOptionLabel={(option) => option.nombre}
      options={options}
      loading={loading}
      renderOption={(props, option) => (
        <Tooltip key={option.codigo} title={option.descripcion} arrow>
          <li {...props}>{option.nombre}</li>
        </Tooltip>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Asynchronous"
          slotProps={{
            input: {
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps?.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
