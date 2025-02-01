import { Usuario } from './Usuario';
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication"
import { API_BASE_URL } from '../../config';

const apiEndpoint = API_BASE_URL + '/users';

interface request {
  data: any;
}

export const useUserService = () => {
  const axiosWithAuthentication = useAxiosWithAuthentication();

  return {
    async getUsuarios(): Promise<any> {
      return axiosWithAuthentication.get<any, request>(apiEndpoint);
    },

    async getUsuario(id: number): Promise<request> {
      return axiosWithAuthentication.get<any, request>(`${apiEndpoint}/${id}`, {
        params: { projection: 'unidadProjection' },
      });
    },

    async crearUsuario(usuario: Usuario): Promise<Usuario> {
      const respuesta = await axiosWithAuthentication.post(apiEndpoint, usuario);
      return respuesta.data;
    },

    async actualizarUsuario(id: number, usuario: Usuario): Promise<Usuario> {
      const respuesta = await axiosWithAuthentication.put(
        `${apiEndpoint}/${id}`,
        usuario.toJSON(),
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return respuesta.data;
    },

    async eliminarUsuario(id: number, forceDelete: boolean = false): Promise<void> {
      await axiosWithAuthentication.delete(`${apiEndpoint}/${id}`, {
        params: { forceDelete: forceDelete }
      });
    },
  };
};
