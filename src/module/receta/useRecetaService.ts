import Receta from "./Receta";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { AxiosError, AxiosResponse } from "axios";
import { API_BASE_URL } from "../../config";
import Ingrediente from "../ingrediente/Ingrediente";

const apiEndpoint = `${API_BASE_URL}/recetario/recetas/`;

/**
 * Interfaz para representar errores en el servicio
 */
interface ServiceError {
  message: string;
  status?: number;
}

export interface GrillaReceta {
  id: number;
  nombre: string;
  ingredientes: string;
}

/**
 * Servicio para interactuar con la API de recetas
 * @returns Objeto con métodos para gestionar recetas
 */
export const useRecetaService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  /**
   * Construye la URL para un endpoint específico de una receta
   * @param id ID de la receta
   * @returns URL completa
   */
  const buildUrl = (id?: number): string => {
    return id ? `${apiEndpoint}${id}/` : apiEndpoint;
  };

  return {
    /**
     * Obtiene la lista de todas las recetas
     * @returns Promesa que resuelve con un arreglo de recetas
     * @throws ServiceError si la solicitud falla
     */
    async getAll(): Promise<Receta[]> {
      try {
        const response = await axiosWithAuthentication.get<Receta[], AxiosResponse<Receta[]>>(
          apiEndpoint,
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener recetas: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener recetas: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Obtiene una receta por su ID
     * @param id ID de la receta
     * @returns Promesa que resuelve con la receta
     * @throws ServiceError si la solicitud falla
     */
    async get(id: number): Promise<Receta> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.get<Receta, AxiosResponse<Receta>>(
          buildUrl(id),
          {
            params: { projection: "unidadProjection" },
          },
        );

        // Convertir el objeto recibido en una instancia de Receta
        const recetaData = response.data;
        return new Receta(
          recetaData.id,
          recetaData.nombre,
          recetaData.rinde,
          recetaData.ingredientes.map(
            (ingrediente) =>
              new Ingrediente(
                ingrediente.id,
                ingrediente.productoId,
                ingrediente.unidadId,
                ingrediente.cantidad,
              ),
          ),
          recetaData.observaciones,
        );
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener receta ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener receta ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Crea una nueva receta
     * @param receta Datos de la receta a crear
     * @returns Promesa que resuelve con la receta creada
     * @throws ServiceError si la solicitud falla
     */
    async crear(receta: Receta): Promise<Receta> {
      try {
        const response = await axiosWithAuthentication.post<Receta, AxiosResponse<Receta>>(
          apiEndpoint,
          receta.toJSON(),
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al crear receta: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al crear receta: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Actualiza una receta existente
     * @param id ID de la receta
     * @param receta Datos actualizados de la receta
     * @returns Promesa que resuelve con la receta actualizada
     * @throws ServiceError si la solicitud falla
     */
    async actualizar(id: number, receta: Receta): Promise<Receta> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.put<Receta, AxiosResponse<Receta>>(
          buildUrl(id),
          receta.toJSON(),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        return response.data;
      } catch (error: unknown) {
        console.log(receta);
        console.log(error);
        if (error instanceof AxiosError) {
          throw {
            message: `Error al actualizar receta ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al actualizar receta ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Elimina una receta por su ID
     * @param id ID de la receta
     * @returns Promesa que resuelve sin valor
     * @throws ServiceError si la solicitud falla
     */
    async eliminar(id: number): Promise<void> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        await axiosWithAuthentication.delete(buildUrl(id));
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al eliminar receta ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al eliminar receta ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Obtiene la grilla de recetas
     * @returns Promesa que resuelve con un arreglo de recetas en formato de grilla
     * @throws ServiceError si la solicitud falla
     */
    async getGrilla(): Promise<GrillaReceta[]> {
      try {
        const response = await axiosWithAuthentication.get<
          GrillaReceta[],
          AxiosResponse<GrillaReceta[]>
        >(`${apiEndpoint}grilla/`);
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener la grilla de recetas: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener la grilla de recetas: ${String(error)}`,
        } as ServiceError;
      }
    },
  };
};
