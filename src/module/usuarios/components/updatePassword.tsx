import { useState } from "react";
import { useForm } from "react-hook-form";
import { Box, TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import HeaderApp from "../../core/components/HeaderApp";
import { passwordValidationRules, confirmPasswordValidation } from "../../../utils/validationRules";

interface RequestForgotPassword {
  token: string;
  passwordValidate: string;
  password: string;
}

const UpdatePassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // Obtiene el token de la URL

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidate, setShowPasswordValidate] = useState(false);

  const { register, handleSubmit, formState, watch } = useForm<RequestForgotPassword>();
  const password = watch("password"); // Observa el valor del campo 'password'

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const togglePasswordValidateVisibility = () => setShowPasswordValidate(!showPasswordValidate);

  const onLoginSubmit = async (data: RequestForgotPassword) => {
    setError("");
    try {
      if (!token) {
        throw new Error("Token no encontrado en la URL");
      }
      await updatePassword({ token: token, password: data.password });
      navigate("/home");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión: " + String(err));
      }
    }
  };

  return (
    <>
      <HeaderApp titulo="Actualiza tu Contraseña" />
      <Box
        sx={{
          height: 400,
          display: "flex",
          justifyContent: "start",
          flexDirection: "column",
          alignItems: "center",
          margin: "0 auto",
        }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <form onSubmit={handleSubmit(onLoginSubmit)}>
            {error && <div className="text-red-500">{error}</div>}
            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              {...register("password", passwordValidationRules)}
              fullWidth
              margin="normal"
              error={!!formState.errors.password}
              helperText={formState.errors.password?.message as string}
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Validate Contraseña"
              type={showPasswordValidate ? "text" : "password"}
              {...register("passwordValidate", confirmPasswordValidation(password))}
              fullWidth
              margin="normal"
              error={!!formState.errors.passwordValidate}
              helperText={formState.errors.passwordValidate?.message as string}
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordValidateVisibility} edge="end">
                        {showPasswordValidate ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Actualizar Constraseña
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
};
export default UpdatePassword;
