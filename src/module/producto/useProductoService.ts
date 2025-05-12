import { AxiosError, AxiosResponse } from "axios";
import Producto from "./Producto";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { API_BASE_URL } from "../../config";

const apiEndpoint = `${API_BASE_URL}/recetario/productos/`;

/**
 * Interfaz para representar errores en el servicio
 */
interface ServiceError {
  message: string;
  status?: number;
}

/**
 * Servicio para interactuar con la API de productos
 * @returns Objeto con métodos para gestionar productos
 */
export const useProductoService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  /**
   * Construye la URL para un endpoint específico de un producto
   * @param id ID del producto
   * @returns URL completa
   */
  const buildUrl = (id?: number): string => {
    return id ? `${apiEndpoint}${id}/` : apiEndpoint;
  };

  return {
    /**
     * Obtiene la lista de todos los productos
     * @returns Promesa que resuelve con un arreglo de productos
     * @throws ServiceError si la solicitud falla
     */
    async getAll(): Promise<Producto[]> {
      try {
        const response = await axiosWithAuthentication.get<
          Producto[],
          AxiosResponse<Producto[]>
        >(apiEndpoint);
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener productos: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener productos: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Obtiene un producto por su ID
     * @param id ID del producto
     * @returns Promesa que resuelve con el producto
     * @throws ServiceError si la solicitud falla
     */
    async get(id: number): Promise<Producto> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.get<
          Producto,
          AxiosResponse<Producto>
        >(buildUrl(id), {
          params: { projection: "unidadProjection" },
        });
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener producto ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener producto ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Crea un nuevo producto
     * @param producto Datos del producto a crear
     * @returns Promesa que resuelve con el producto creado
     * @throws ServiceError si la solicitud falla
     */
    async crear(producto: Producto): Promise<Producto> {
      try {
        const response = await axiosWithAuthentication.post<
          Producto,
          AxiosResponse<Producto>
        >(apiEndpoint, producto);
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al crear producto: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al crear producto: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Actualiza un producto existente
     * @param id ID del producto
     * @param producto Datos actualizados del producto
     * @returns Promesa que resuelve con el producto actualizado
     * @throws ServiceError si la solicitud falla
     */
    async actualizar(id: number, producto: Producto): Promise<Producto> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.put<
          Producto,
          AxiosResponse<Producto>
        >(buildUrl(id), producto, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al actualizar producto ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al actualizar producto ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Elimina un producto por su ID
     * @param id ID del producto
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
            message: `Error al eliminar producto ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al eliminar producto ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },
  };
};

