import { useEffect, useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import useAxiosWithAuthentication from "../../core/useAxiosWithAuthentication";
import { API_BASE_URL } from "../../../config";
import { Permiso } from "../../contexts/Permisos";
import { Checkbox, FormControl, FormHelperText } from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const apiEndpoint = API_BASE_URL + "/Permisos";

interface PermisosAutoCompleteProps {
    value: Permiso[];
    onChange: (value: Permiso[]) => void;
    error?: string;
}

export default function PermisosAutoComplete({ value, onChange, error }: PermisosAutoCompleteProps) {
    const [options, setOptions] = useState<Permiso[]>([]);
    const [loading, setLoading] = useState(false);
    const axiosWithAuthentication = useAxiosWithAuthentication();
    const isFetched = useRef(false);
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    useEffect(() => {
        if (isFetched.current) return;
        isFetched.current = true;

        setLoading(true);
        axiosWithAuthentication.get(apiEndpoint)
            .then((response) => {
                setOptions(response.data);
            })
            .catch(() => setOptions([]))
            .finally(() => setLoading(false));
    }, []);

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
                loading={loading}
                renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    return (
                    <li key={key} {...optionProps}>
                        <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        />
                        {option.nombre}
                    </li>
                    );
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Permisos" placeholder="Permisos" margin="dense"/>
                )}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
    );
}
