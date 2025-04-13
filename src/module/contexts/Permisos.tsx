import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { API_BASE_URL } from '../../config';

const apiEndpoint = API_BASE_URL + '/Permisos';

export interface Rol {
  code: string;
  nombre: string;
}

export interface Permiso {
  code: string;
  nombre: string;
  descripcion: string;
}

interface Permisos {
  [key: string]: string; // Mapea códigos de permisos a sus valores
}

const defaultPermisos: Permisos = {};

export const allRoles : Rol[] = [
  { code: "ROLE_ADMIN", nombre: "Administrador" },
  { code: "ROLE_USER", nombre: "Pasteleria" },
];

export const createRolesArray = (rolesCodes: String[]) => {
  return allRoles.filter((rol) => rolesCodes.includes(rol.code));
}

export const createPermisosArray = (permisosCodes: string[], permisosContext: Permisos) => {
  return permisosCodes.map((code) => ({
    code,
    nombre: permisosContext[code] || "Desconocido",
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
        console.log('Permisos recibidos:', permisosData);
        // Construimos el objeto de permisos basado en los datos recibidos
        const newPermisos: Permisos = permisosData.reduce((acc, permiso) => {
          acc[permiso.code] = permiso.code; // Mapear código del permiso a sí mismo
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
