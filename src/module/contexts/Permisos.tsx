import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { API_BASE_URL } from "../../config";
import { useAuth } from "./AuthContext";

const apiEndpoint = API_BASE_URL + "/users/permissions/";

export interface Rol {
  code: string;
  nombre: string;
}

export interface Permiso {
  id: number;
  codename: string;
  name: string;
  descripcion: string;
}

interface Permisos {
  [key: string]: string; // Mapea códigos de permisos a sus valores
}

const defaultPermisos: Permisos = {};

export const allRoles: Rol[] = [
  { code: "ROLE_ADMIN", nombre: "Administrador" },
  { code: "ROLE_USER", nombre: "Pasteleria" },
];

const PermisosContext = createContext<Permisos | undefined>(undefined);

export const PermisosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permisos, setPermisos] = useState<Permisos>(defaultPermisos);
  const { isAuthenticated } = useAuth();
  const axiosWithAuthentication = useAxiosWithAuthentication();

  useEffect(() => {
    const fetchPermisos = async () => {
      if (isAuthenticated) {
        try {
          const response = await axiosWithAuthentication.get(apiEndpoint);
          const permisosData: Permiso[] = response.data;
          // Construimos el objeto de permisos basado en los datos recibidos
          const newPermisos: Permisos = permisosData.reduce((acc, permiso) => {
            acc[permiso.codename] = permiso.codename; // Mapear código del permiso a sí mismo
            return acc;
          }, {} as Permisos);
          setPermisos(newPermisos);
        } catch (error) {
          console.warn("Error al cargar los permisos:", error);
          setPermisos(defaultPermisos); // En caso de error, revertimos a los valores por defecto
        }
      }
    };

    fetchPermisos();
  }, []);

  return <PermisosContext.Provider value={permisos}>{children}</PermisosContext.Provider>;
};

export const usePermisos = () => {
  const context = useContext(PermisosContext);
  if (!context) {
    console.warn("usePermisos fue llamado fuera de PermisosProvider");
    return defaultPermisos;
  }
  return context;
};
