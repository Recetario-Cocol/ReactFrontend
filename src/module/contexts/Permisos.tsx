import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { API_BASE_URL } from '../../config';

const apiEndpoint = API_BASE_URL + '/Permisos';

export interface Rol {
  codigo: string;
  nombre: string;
}

export interface Permiso {
  codigo: string;
  nombre: string;
  descripcion: string;
}

interface Permisos {
  [key: string]: string; // Mapea códigos de permisos a sus valores
}

const defaultPermisos: Permisos = {};

export const allRoles : Rol[] = [
  { codigo: "ROLE_ADMIN", nombre: "Administrador" },
  { codigo: "ROLE_USER", nombre: "Pasteleria" },
];

export const createRolesArray = (rolesCodes: String[]) => {
  return allRoles.filter((rol) => rolesCodes.includes(rol.codigo));
}

export const createPermisosArray = (permisosCodes: string[], permisosContext: Permisos) => {
  return permisosCodes.map((codigo) => ({
    codigo,
    nombre: permisosContext[codigo] || "Desconocido",
    descripcion: "",
  }));
};

const PermisosContext = createContext<Permisos | undefined>(undefined);

export const PermisosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permisos, setPermisos] = useState<Permisos>(defaultPermisos);
  const axiosWithAuthentication = useAxiosWithAuthentication();

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const response = await axiosWithAuthentication.get(apiEndpoint);
        const permisosData: Permiso[] = response.data;

        // Construimos el objeto de permisos basado en los datos recibidos
        const newPermisos: Permisos = permisosData.reduce((acc, permiso) => {
          acc[permiso.codigo] = permiso.codigo; // Mapear código del permiso a sí mismo
          return acc;
        }, {} as Permisos);

        setPermisos(newPermisos);
      } catch (error) {
        console.warn('Error al cargar los permisos:', error);
        setPermisos(defaultPermisos); // En caso de error, revertimos a los valores por defecto
      }
    };

    fetchPermisos();
  }, []);

  return (
    <PermisosContext.Provider value={permisos}>
      {children}
    </PermisosContext.Provider>
  );
};

export const usePermisos = () => {
  const context = useContext(PermisosContext);
  if (!context) {
    console.warn('usePermisos fue llamado fuera de PermisosProvider');
    return defaultPermisos;
  }
  return context;
};
