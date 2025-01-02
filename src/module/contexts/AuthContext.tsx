import React, { createContext, useContext, useState } from 'react';
import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from '../../config';
const apiEndpoint = '/auth/login';

interface User {
  id: string;
  email: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  "type": string;
  "title": string;
  "status": number;
  "detail": string;
  "instance": string;
  "description": string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (data: LoginData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${apiEndpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'credentials': 'include',
        },
      });
  
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 400:
              throw new Error('Datos inválidos');
            case 401:
              throw new Error(data?.description || 'No autorizado');
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
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
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

export type { AuthContextType, LoginData, User };

