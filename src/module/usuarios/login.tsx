import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate(); // Aquí
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState('');
    const onSubmit = async (data: any) => {
        setError('');
        try {
            await login(data);
            navigate('/home');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al iniciar sesión: ' + String(err));
            }
        } 
    };
    
    return (
        <Box sx={{ height: 400, display: 'flex', justifyContent: 'center'}}>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="text-red-500">{error}</div>}
                <TextField label="Usuario" {...register('email', { required: true })} fullWidth margin="normal" error={!!errors.usuario} helperText={errors.usuario?.message as string || ''} />
                <TextField label="Contraseña" type="password" {...register('password', { required: true })} fullWidth margin="normal" error={!!errors.contraseña} helperText={errors.contraseña?.message as string || ''} />
                <Button type="submit" variant="contained" color="primary">
                    Login
                </Button>
            </form>
        </Box>
   );
};
export default Login;
