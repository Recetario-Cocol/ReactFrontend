import { AxiosError, AxiosResponse } from "axios";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { API_BASE_URL } from "../../config";
import { Unidad } from "./Unidad";

const apiEndpoint = `${API_BASE_URL}/recetario/unidades/`;

/**
 * Interfaz para representar errores en el servicio
 */
interface ServiceError {
  message: string;
  status?: number;
}

/**
 * Servicio para interactuar con la API de unidades
 * @returns Objeto con métodos para gestionar unidades
 */
export const useUnidadService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  /**
   * Construye la URL para un endpoint específico de una unidad
   * @param id ID de la unidad
   * @returns URL completa
   */
  const buildUrl = (id?: number): string => {
    return id ? `${apiEndpoint}${id}/` : apiEndpoint;
  };

  return {
    /**
     * Obtiene la lista de todas las unidades
     * @returns Promesa que resuelve con un arreglo de unidades
     * @throws ServiceError si la solicitud falla
     */
    async getUnidades(): Promise<Unidad[]> {
      try {
        const response = await axiosWithAuthentication.get<Unidad[], AxiosResponse<Unidad[]>>(
          apiEndpoint,
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener unidades: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener unidades: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Obtiene una unidad por su ID
     * @param id ID de la unidad
     * @returns Promesa que resuelve con la unidad
     * @throws ServiceError si la solicitud falla
     */
    async getUnidad(id: number): Promise<Unidad> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.get<Unidad, AxiosResponse<Unidad>>(
          buildUrl(id),
          {
            params: { projection: "unidadProjection" },
          },
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener unidad ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener unidad ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Crea una nueva unidad
     * @param unidad Datos de la unidad a crear
     * @returns Promesa que resuelve con la unidad creada
     * @throws ServiceError si la solicitud falla
     */
    async crearUnidad(unidad: Unidad): Promise<Unidad> {
      try {
        const response = await axiosWithAuthentication.post<Unidad, AxiosResponse<Unidad>>(
          apiEndpoint,
          unidad,
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al crear unidad: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al crear unidad: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Actualiza una unidad existente
     * @param id ID de la unidad
     * @param unidad Datos actualizados de la unidad
     * @returns Promesa que resuelve con la unidad actualizada
     * @throws ServiceError si la solicitud falla
     */
    async actualizarUnidad(id: number, unidad: Unidad): Promise<Unidad> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.put<Unidad, AxiosResponse<Unidad>>(
          buildUrl(id),
          unidad,
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al actualizar unidad ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al actualizar unidad ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Elimina una unidad por su ID
     * @param id ID de la unidad
     * @returns Promesa que resuelve sin valor
     * @throws ServiceError si la solicitud falla
     */
    async eliminarUnidad(id: number): Promise<void> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        await axiosWithAuthentication.delete(buildUrl(id));
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al eliminar unidad ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al eliminar unidad ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },
  };
};
