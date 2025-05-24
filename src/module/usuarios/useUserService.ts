import { Usuario, UserFromApi } from "./Usuario";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { API_BASE_URL } from "../../config";
import { AxiosResponse, AxiosError } from "axios";

/**
 * Interfaz para representar errores en el servicio
 */
interface ServiceError {
  message: string;
  status?: number;
}

const apiEndpoint = API_BASE_URL + "/users/";

export const useUserService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  /**
   * Construye la URL para un endpoint específico de un usuario
   * @param id ID del usuario
   * @returns URL completa
   */
  const buildUrl = (id?: number): string => {
    return id ? `${apiEndpoint}${id}/` : apiEndpoint;
  };

  return {
    /**
     * Obtiene la lista de todos los usuarios
     * @returns Promesa que resuelve con un arreglo de usuarios
     * @throws ServiceError si la solicitud falla
     */
    async getUsuarios(): Promise<Usuario[]> {
      try {
        const response = await axiosWithAuthentication.get<
          UserFromApi[],
          AxiosResponse<UserFromApi[]>
        >(buildUrl());
        return response.data.map((item: UserFromApi) => Usuario.fromJSON(item));
      } catch (error: unknown) {
        console.log(error);
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener usuarios: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener usuarios: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Obtiene un usuario por su ID
     * @param id ID del usuario
     * @returns Promesa que resuelve con el usuario
     * @throws ServiceError si la solicitud falla
     */
    async getUsuario(id: number): Promise<Usuario> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.get<UserFromApi, AxiosResponse<UserFromApi>>(
          buildUrl(id),
          {
            params: { projection: "unidadProjection" },
          },
        );
        return Usuario.fromJSON(response.data);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al obtener usuario ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al obtener usuario ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Crea un nuevo usuario
     * @param usuario Datos del usuario a crear
     * @returns Promesa que resuelve con el usuario creado
     * @throws ServiceError si la solicitud falla
     */
    async crearUsuario(usuario: Usuario): Promise<Usuario> {
      try {
        const response = await axiosWithAuthentication.post<Usuario, AxiosResponse<Usuario>>(
          buildUrl(),
          usuario,
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al crear usuario: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al crear usuario: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Actualiza un usuario existente
     * @param id ID del usuario
     * @param usuario Datos actualizados del usuario
     * @returns Promesa que resuelve con el usuario actualizado
     * @throws ServiceError si la solicitud falla
     */
    async actualizarUsuario(id: number, usuario: Usuario): Promise<Usuario> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        const response = await axiosWithAuthentication.put<Usuario, AxiosResponse<Usuario>>(
          buildUrl(id),
          usuario,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        return response.data;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al actualizar usuario ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al actualizar usuario ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },

    /**
     * Elimina un usuario por su ID
     * @param id ID del usuario
     * @param forceDelete Indica si se debe forzar la eliminación
     * @returns Promesa que resuelve sin valor
     * @throws ServiceError si la solicitud falla
     */
    async eliminarUsuario(id: number, forceDelete: boolean = false): Promise<void> {
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El ID debe ser un número entero positivo") as ServiceError;
      }
      try {
        await axiosWithAuthentication.delete(buildUrl(id), {
          params: { force: forceDelete },
        });
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          throw {
            message: `Error al eliminar usuario ${id}: ${error.message}`,
            status: error.response?.status,
          } as ServiceError;
        }
        throw {
          message: `Error desconocido al eliminar usuario ${id}: ${String(error)}`,
        } as ServiceError;
      }
    },
  };
};
