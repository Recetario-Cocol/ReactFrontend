import React, { createContext, useContext, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../../config';
const loginEndpoint = '/auth/login';
const signupEndpoint = '/auth/signup';
const updatePasswordEndpoint = '/auth/updatePassword';
const forgotPasswordEndpoint = '/auth/forgotPassword';

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  fullName: string;
}

interface UpdatePasswordData{
  token: string;
  password: string;
}

interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
  name: string;
  email: string;
}

interface AuthContextType {
  userName: String;
  email: String;
  token: string | null;
  isAdmin: boolean;
  signup: (data: SignupData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  forgotPassword: (userId: number) => void;
  updatePassword: (data: UpdatePasswordData) => void;
  isAuthenticated: boolean;
  hasPermission: (permission: String) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<String>('');
  const [email, setEmail] = useState<String>('');
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [roles, setRoles] = useState<String[]>([]);

  const handleAuthRequest = async (endpoint: string, data: LoginData | SignupData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
      });
  
      const { token } = response.data;
  
      const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
      const roles = decodedToken.roles || [];
      setToken(token);
      setUserName(decodedToken.name);
      setEmail(decodedToken.email);
      setIsAdmin(roles.includes('ROLE_ADMIN'));
      setRoles(roles);
      localStorage.setItem('authToken', token);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 400:
              throw new Error('Datos inválidos');
            case 401:
              throw new Error(data?.error || 'No autorizado');
            case 403:
              throw new Error('Acceso prohibido');
            case 404:
              throw new Error('Recurso no encontrado');
            case 500:
              throw new Error('Error interno del servidor');
            default:
              throw new Error(`Error HTTP: ${status}`);
          }
        } else {
          throw new Error('Error desconocido');
        }
      } else {
        throw new Error('Error desconocido');
      }
    }
  };

  const login = async (data: LoginData) => {
    await handleAuthRequest(loginEndpoint, data);
  };
  
  const signup = async (data: SignupData) => {
    await handleAuthRequest(signupEndpoint, data);
  };

  const updatePassword = async (data: UpdatePasswordData) => {
     try {
      const response = await axios.post(`${API_BASE_URL}${updatePasswordEndpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 400:
              throw new Error('Datos inválidos');
            case 401:
              throw new Error(data?.error || 'No autorizado');
            case 403:
              throw new Error('Acceso prohibido');
            case 404:
              throw new Error('Recurso no encontrado');
            case 500:
              throw new Error('Error interno del servidor');
            default:
              throw new Error(`Error HTTP: ${status}`);
          }
        } else {
          throw new Error('Error desconocido');
        }
      } else {
        throw new Error('Error desconocido');
      }
    }
  }

  const forgotPassword = async (userId: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${forgotPasswordEndpoint}`, userId, {
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
      });
  
      if (response.status === 200) {
      } else {
        throw new Error("Error al enviar el correo de restablecimiento.");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const { status } = error.response;
          switch (status) {
            case 400:
              throw new Error('Datos inválidos');
            case 401:
              throw new Error('No autorizado');
            case 403:
              throw new Error('Acceso prohibido');
            case 404:
              throw new Error('Recurso no encontrado');
            case 500:
              throw new Error('Error interno del servidor');
            default:
              throw new Error(`Error HTTP: ${status}`);
          }
        } else {
          throw new Error('Error desconocido');
        }
      } else {
        throw new Error('Error desconocido');
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUserName('');
    setIsAdmin(false);
    setEmail('');
    setRoles([]);
    localStorage.removeItem('authToken');
  };

  const hasPermission = (permission: String) => {
    return roles.includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      userName,
      email,
      token,
      isAdmin,
      signup,
      login,
      logout,
      updatePassword,
      forgotPassword,
      isAuthenticated: !!token,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export type { AuthContextType, LoginData };
