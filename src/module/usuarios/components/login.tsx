import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HeaderApp from '../../core/components/HeaderApp';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { passwordValidationRules } from '../../../utils/validationRules';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ width: '100%' }}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const Login = () => {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [value, setValue] = React.useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const {
        register: registerLogin,
        handleSubmit: handleSubmitLogin,
        formState: { errors: loginErrors },
    } = useForm();

    const onLoginSubmit = async (data: any) => {
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

    const {
        register: registerSignup,
        handleSubmit: handleSubmitSignup,
        formState: { errors: signupErrors },
    } = useForm();

    const onSignupSubmit = async (data: any) => {
        setError('');
        try {
            await signup(data);
            navigate('/home');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al registrarse: ' + String(err));
            }
        }
    };

    function a11yProps(index: number) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <>
            <HeaderApp titulo="Inicia Sesión" />
            <Box sx={{height: 400, display: 'flex', justifyContent: 'start', flexDirection: 'column', alignItems: 'center', margin: '0 auto', }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Inicia Sesión" {...a11yProps(0)} />
                        <Tab label="Regístrate" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <Box sx={{ width: '100%', maxWidth: 400 }}>
                        <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
                            {error && <div className="text-red-500">{error}</div>}
                            <TextField label="Usuario" {...registerLogin('email', { required: 'El email es obligatorio' })} fullWidth 
                                margin="normal" error={!!loginErrors.email} helperText={loginErrors.email?.message as string} />
                            <TextField 
                                label="Contraseña" 
                                type={showPassword ? 'text' : 'password'}
                                {...registerLogin('password', {required: 'La contraseña es obligatoria'})} 
                                fullWidth 
                                margin="normal" 
                                error={!!loginErrors.password} 
                                helperText={loginErrors.password?.message as string} 
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
                            <Button type="submit" variant="contained" color="primary" fullWidth>Login</Button>
                        </form>
                    </Box>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <Box sx={{ width: '100%', maxWidth: 400 }}>
                        <form onSubmit={handleSubmitSignup(onSignupSubmit)}> 
                            {error && <div className="text-red-500">{error}</div>}
                            <TextField label="Nombre" {...registerSignup('fullName', { required: 'El nombre es obligatorio' })} fullWidth
                                margin="normal" error={!!signupErrors.fullName} helperText={signupErrors.fullName?.message as string} />
                            <TextField label="Email" {...registerSignup('email', { required: 'El email es obligatorio' })} fullWidth
                                margin="normal" error={!!signupErrors.email} helperText={signupErrors.email?.message as string} />
                            <TextField label="Contraseña" type={showPassword ? 'text' : 'password'} {...registerSignup('password', passwordValidationRules)} fullWidth
                                margin="normal" error={!!signupErrors.password} helperText={signupErrors.password?.message as string} 
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
                            <Button type="submit" variant="contained" color="primary" fullWidth>Registrarme</Button>
                        </form>
                    </Box>
                </CustomTabPanel>
            </Box>
        </>
    );
};
export default Login;